import { createMachine } from 'https://cdn.skypack.dev/xstate';

const trafficLightMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAOilTDADsBiAUQDc7kACARkVAAcB7WDmQ5+tHiAAeiALScADAE5yAZgDsAFgAcANkWKtBrfICsWgDQgAnohXzy++VrXHOWjTrMmAvt8tosXEJiMnIrMAAbCP4AdyZWWg4AJgkBIRExCWkETh17Tk4knQKTPK1St0sbBDsHRScXeTcPL19-DGx8IlIKagh4tnYUpBA04VFxEezOZXKDE04NExUDRSSLa0QFE3IktzWtJJN5FcUNDV8-EFp+CDgJAM7gnspqOlTBccyp2T2dci05Q0ihWezUnhUJiqiCSGgcgKSLg0alKmh0OjaIEeQW6oXCUViH3SEyyMM45DU8iS6waCxMGhO0IQsPhhyRKJ0aJUKkx2K6IV6kCJX0moGySUUal2nDUSW5ajO5RUG2qLKMiPcHLRil5HRxAuFGVFUl+DIBQJBaxlEKhmwQMmR5HkzudkoUnGVJjUl28QA */
  createMachine({
    tsTypes: {} as import("./workflow.typegen").Typegen0,
    schema: {
      context: {} as { contextType },
      events: {} as { type: 'eventType' },
    },
    id: 'trafficLight',
    initial: 'green',
    states: {
      green: {
        on: {
          'Event 1': {
            target: 'yellow',
          },
        },
      },
      yellow: {
        on: {
          'Event 2': {
            target: 'red',
          },
        },
      },
      red: {
        on: {
          'Event 2': {
            target: 'green',
          },
        },
      },
    },
  });

export default async function () {
  return new Response('Hello from the edge');
}
