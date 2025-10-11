export const competitionData = {
  data: {
    competition: {
      __typename: "Competition",
      access: {
        __typename: "CompetitionAccess",
        canScoretake: false,
      },
      competitionEvents: [
        {
          __typename: "CompetitionEvent",
          event: {
            __typename: "Event",
            id: "333",
            name: "3x3x3 Cube",
          },
          id: "64928",
          rounds: [
            {
              __typename: "Round",
              id: "119503",
              label: "Done",
              name: "First Round",
              open: true,
            },
            {
              __typename: "Round",
              id: "119504",
              label: "Done",
              name: "Final",
              open: true,
            },
          ],
        },
        {
          __typename: "CompetitionEvent",
          event: {
            __typename: "Event",
            id: "333bf",
            name: "3x3x3 Blindfolded",
          },
          id: "64929",
          rounds: [
            {
              __typename: "Round",
              id: "119505",
              label: "Done",
              name: "First Round",
              open: true,
            },
            {
              __typename: "Round",
              id: "119506",
              label: "Done",
              name: "Final",
              open: true,
            },
          ],
        },
      ],
      id: "8992",
      shortName: "Kanto Autumn AM 2025",
    },
  },
};
