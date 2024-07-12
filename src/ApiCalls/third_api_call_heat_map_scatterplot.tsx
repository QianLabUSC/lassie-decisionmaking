// //DEBUG_HERE_TEST DEBUG API CALL
export function thirdApiCallHeatMapScatterPLot(
  step_number,
  selected_path_index,
  end_x_cordinate,
  end_y_cordinate,
  selected_path_data
) {
  // {
  //     "step_number":1,
  //     "selected_path_number":2,
  //     "end_x_cordinate": 0.17514517,
  //     "end_y_cordinate": 0.1737063,
  //     "selected_path_data": [
  //         [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
  //         [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
  //         [1, 1, 1, 1, 1],
  //         [1, 1, 1, 1, 1]
  //     ]
  // }

  const inputs = {
    step_number: step_number,
    selected_path_number: selected_path_index,
    end_x_cordinate: end_x_cordinate,
    end_y_cordinate: end_y_cordinate,
    selected_path_data: selected_path_data,
  };

  return new Promise((resolve, reject) => {
    // fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/process', { //production URL
    fetch('http://127.0.0.1:5000/third_api/gather_data', {
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

  //   RESPONSE  FILE SAVE TO JSON AND BELOW DATA
  // {
  //     "line_data": {
  //         "start_cordinate":[],
  //         "end_corindate":[]
  //     },
  //     "scatter_plot_data":{
  //        "x": [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
  //        "y": [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
  //        "moisture": [2,3,4,5,6],
  //        "shear": [6,7,8,4,1]
  //     },
  //     "selected_path_data":[
  //         [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
  //         [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
  //         [2,3,4,5,6],
  //         [6,7,8,4,1]
  //     ]
  // }
}
