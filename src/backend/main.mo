import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

// Persistent State and Migrations
(with migration = Migration.run)
actor {
  // Persistent Counters for IDs
  var classIdCounter = 0;
  var periodIdCounter = 0;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Data Types
  type ClassRecord = {
    id : Nat;
    name : Text;
    year : Text;
    createdAt : Time.Time;
  };

  module ClassRecord {
    public func compare(record1 : ClassRecord, record2 : ClassRecord) : Order.Order {
      Nat.compare(record1.id, record2.id);
    };
  };

  type PeriodRecord = {
    id : Nat;
    classId : Nat;
    date : Text;
    periodNumber : Nat;
    summaryPrimary : Text;
    summarySecondary : Text;
    createdAt : Time.Time;
  };

  module PeriodRecord {
    public func compare(record1 : PeriodRecord, record2 : PeriodRecord) : Order.Order {
      switch (Text.compare(record1.date, record2.date)) {
        case (#equal) { Nat.compare(record1.periodNumber, record2.periodNumber) };
        case (order) { order };
      };
    };
  };

  type PeriodInput = {
    classId : Nat;
    date : Text;
    periodNumber : Nat;
    summaryPrimary : Text;
    summarySecondary : Text;
  };

  // Persistent Storage
  let classes = Map.empty<Nat, ClassRecord>();
  let periods = Map.empty<Nat, PeriodRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public Methods
  public shared ({ caller }) func registerClass(name : Text, year : Text) : async Nat {
    let classId = classIdCounter;
    classIdCounter += 1;
    let classRecord : ClassRecord = {
      id = classId;
      name;
      year;
      createdAt = Time.now();
    };
    classes.add(classId, classRecord);
    classId;
  };

  public query ({ caller }) func getClass(classId : Nat) : async ClassRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view classes");
    };
    switch (classes.get(classId)) {
      case (null) { Runtime.trap("Class not found") };
      case (?classRecord) { classRecord };
    };
  };

  public shared ({ caller }) func addPeriod(input : PeriodInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add periods");
    };
    let classExists = classes.containsKey(input.classId);
    if (not classExists) {
      Runtime.trap("Class does not exist");
    };
    let periodId = periodIdCounter;
    periodIdCounter += 1;
    let periodRecord : PeriodRecord = {
      id = periodId;
      classId = input.classId;
      date = input.date;
      periodNumber = input.periodNumber;
      summaryPrimary = input.summaryPrimary;
      summarySecondary = input.summarySecondary;
      createdAt = Time.now();
    };
    periods.add(periodId, periodRecord);
  };

  public query ({ caller }) func getPeriodsForDate(classId : Nat, date : Text) : async [PeriodRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view periods");
    };
    periods.values().filter(func(period) { period.classId == classId and period.date == date }).toArray().sort();
  };
};
