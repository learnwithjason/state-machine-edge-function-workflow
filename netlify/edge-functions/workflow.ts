import { createMachine } from 'https://cdn.skypack.dev/xstate';
import { connect } from 'https://unpkg.com/@planetscale/database@^0.6.1';

const trafficLightMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAOilTDADsBiAOQFEANAFUVAAcB7WHMhy9aXEAA9EAWgCMc8gA4FMgOwKAbDICsAZgAsAThkAGAEwAaEAE9EKneU1bDenceM716vQoC+Py2hYuITEZORWYAA2kbwA7kxsnEggfAJCImI2CKZ65AZKpmp6KlrqKnrqOjqWkggyyg5aCkYGpnJVpSp+ARjY+ESkFNQQCRxiqYLCoslZOXkFRSVlFQY1iHqG5MXGKqYKxlolhjJ6fv4gtLwQcGKBfSGDlNR04-yTGcm1Um3qigpOBh0rVU6l0Wkss1y+QUhQUxU6FXU3RAd2CAzCEWicVeaSmYlqbXIKjMe2MChK2j07ghiDm0Nh8OWlR0yNR-VCQ0gOPe01ABIMKnIbV2VRUBm8ugUNOyUIWcKW5XUBlZvTRHO56V5EmkOWMfwBQOFoJ04Os0gqeQMVtBpgBWlMOm0Zx8QA */
  createMachine({
    schema: { events: {} as { type: 'eventType' } },
    id: 'trafficLight',
    initial: 'green',
    states: {
      green: {
        on: {
          NEXT: {
            target: 'yellow',
          },
        },
      },
      yellow: {
        on: {
          NEXT: {
            target: 'red',
          },
        },
      },
      red: {
        on: {
          NEXT: {
            target: 'green',
          },
        },
      },
    },
  });

export default async function (request: Request) {
  // if request method is PUT, override
  const db = connect({ url: Deno.env.get('PLANETSCALE_DB_URL') });

  // to reset the state machine, send a PUT request
  if (request.method === 'PUT') {
    await db.execute(
      'UPDATE workflows SET state = ?, machine = ? WHERE id = ?;',
      [
        JSON.stringify(trafficLightMachine.initialState),
        JSON.stringify(trafficLightMachine),
        1,
      ],
    );

    return new Response('ok', { status: 200 });
  }

  if (request.method === 'POST') {
    // events are sent here
    const data = await request.json();

    console.log(JSON.stringify(data, null, 2));

    const { rows } = await db.execute('SELECT * FROM workflows WHERE id = ?;', [
      1,
    ]);
    const workflowData = rows[0];

    const nextState = trafficLightMachine.transition(
      trafficLightMachine.resolveState(workflowData.state),
      data,
    );

    console.log({ nextState });

    await db.execute('UPDATE workflows SET state = ? WHERE id = ?;', [
      JSON.stringify(nextState),
      1,
    ]);

    return new Response('updated', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const results = await db.execute('SELECT * FROM workflows WHERE id = ?', [1]);

  return new Response(JSON.stringify(results.rows[0]), {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
