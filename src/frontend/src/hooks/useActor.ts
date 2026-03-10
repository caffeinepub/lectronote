import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const prevIdentityRef = useRef<string | undefined>(undefined);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // Only invalidate dependent queries when the identity actually changes
  // (not on every component mount with a cached actor)
  useEffect(() => {
    const currentIdentity = identity?.getPrincipal().toString();
    if (actorQuery.data && currentIdentity !== prevIdentityRef.current) {
      const isInitialLoad = prevIdentityRef.current === undefined;
      prevIdentityRef.current = currentIdentity;
      // Skip refetch on initial mount -- queries will fetch themselves
      if (!isInitialLoad) {
        queryClient.invalidateQueries({
          predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
        });
        queryClient.refetchQueries({
          predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
        });
      }
    }
  }, [actorQuery.data, identity, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
