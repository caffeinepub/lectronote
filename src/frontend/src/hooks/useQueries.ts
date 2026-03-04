import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClassRecord, PeriodInput, PeriodRecord } from "../backend.d.ts";
import { useActor } from "./useActor";

// ─── Class Queries ───────────────────────────────────────────

export function useGetClass(classId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ClassRecord | null>({
    queryKey: ["class", classId?.toString()],
    queryFn: async () => {
      if (!actor || classId === null) return null;
      try {
        const result = await actor.getClass(classId);
        return result;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && classId !== null,
    retry: false,
  });
}

export function useRegisterClass() {
  const { actor } = useActor();
  return useMutation<bigint, Error, { name: string; year: string }>({
    mutationFn: async ({ name, year }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerClass(name, year);
    },
  });
}

export function useLoginClass() {
  const { actor } = useActor();
  return useMutation<ClassRecord, Error, bigint>({
    mutationFn: async (classId) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.getClass(classId);
      if (!result) throw new Error("Invalid Class ID");
      return result;
    },
  });
}

// ─── Period Queries ──────────────────────────────────────────

export function useGetPeriodsForDate(classId: bigint | null, date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PeriodRecord[]>({
    queryKey: ["periods", classId?.toString(), date],
    queryFn: async () => {
      if (!actor || classId === null || !date) return [];
      return actor.getPeriodsForDate(classId, date);
    },
    enabled: !!actor && !isFetching && classId !== null && !!date,
  });
}

export function useAddPeriod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, PeriodInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPeriod(input);
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: ["periods", input.classId.toString(), input.date],
      });
    },
  });
}
