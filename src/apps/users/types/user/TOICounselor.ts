export type TOtherInfoCounselor = {
  specialization: string;
  unavailableTimes?: {
    [day: string]: {
      start: string;
      end: string;
    }[];
  };
  roomNumber: string;
};

// Example usage:

// unavailableTimes: {
//   Monday: [
//     { start: "08:00", end: "09:00" },
//     { start: "15:00", end: "16:00" }
//   ],
//   Wednesday: [
//     { start: "13:00", end: "14:30" }
//   ]
// }
