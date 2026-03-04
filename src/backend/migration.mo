module {
  public type Actor = {
    classIdCounter : Nat;
    periodIdCounter : Nat;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
