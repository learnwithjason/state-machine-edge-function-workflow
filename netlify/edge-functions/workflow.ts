import { createMachine } from 'https://cdn.skypack.dev/xstate';
import { connect } from 'https://unpkg.com/@planetscale/database@^0.6.1';

const trafficLightMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAOilTDADsBiAOQFEANAFUVAAcB7WHMhy9aXEAA9EAWgBMc8gA4ADAHZlAZgUylAVnUA2AJw6ANCACe0gIz7yOm0qUAWGU7VKZKpwF9vZtFi4hMRk5OZgADYRvADuTGycSCB8AkIiYpII+lbkhgoKOqoK7uqGxk5mlgiyMnZWCtkqXoZOVk4uOr7+GNj4RKQU1BDxHGIpgsKiSZlG5LotnmouVkoFlYhWVuq5Ngotzu3q7fpdIAG9wQPk3ACuqNwRYCOJPPwT6dPS6jI5hjI6ZQUVh0rScCnU6wQKlseh09gUrXqOhk+hkvj8IFovAgcDE5yC-VCVBoU1eqUmGS+BjscMMun+hWyVkhNTqDSsTScLTapROGPxfRCFHCUViYzeaVJEmkhhUuX0QPUzh0QNaRhZ8nhjWaoI6pwFl1CQ3F5I+oEyHLlIIVcic2ThQJkGtqWstXNBBgU+p6BKF1zuDzAJveUsyUj+uU8bi0TiU+iU6mBkJWcsMbRkyhBGbkQO9gUFA2Dksp1QMShpAPpcLjmxZLTscbTmk0+iOTnU6O8QA */
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
            target: 'purple',
          },
        },
      },
      purple: {
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
