// //DEBUG_HERE_TEST DEBUG API CALL
export function firstApiGetThreePaths(
  iterations,
  input_human_belief,
  input_human_rank_order,
  x_origin,
  y_origin
) {
  //  const input2 = {
  //     "input1_human_belief": {
  //         "human_belief_selected_option": 1 ,
  //         "human_belief_text_description":""
  //     },
  //     "input2_human_rank_order": [1,2,3,4],
  //     "x_origin": 0,
  //     "y_origin": 0
  //  }

  const inputs = {
    iterations: iterations,
    input1_human_belief: input_human_belief,
    input2_human_rank_order: input_human_rank_order,
    x_origin: x_origin,
    y_origin: y_origin,
  };

  return new Promise((resolve, reject) => {
    // fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/process', { //production URL
    fetch('http://127.0.0.1:5000/first_api/generate_initial_path', {
      //local development URL
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    })
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });

  //   RESPONSE

  // generate 3 intail ordinates
  // firstPath=[
  //   [
  //     [0, 0.012699544, 0.01377393, 0.0148343254, 0.148540198, 0.1889489748],
  //     [0, 0.01330707, 0.13732145, 0.14574513, 0.14924912, 0.1554568],
  //     [], # prior values
  //     [], #prior values
  //   ],
  //   [
  //     [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
  //     [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
  //     [],
  //     [],
  //   ],
  //   [
  //     [0, 0.012699544, 0.1339001, 0.14742749, 0.16707451, 0.1682743],
  //     [0, 0.01330707, 0.01474205, 0.1509101, 0.1752565, 0.1793485],
  //     [],
  //     [],
  //   ],
  // ]
}
