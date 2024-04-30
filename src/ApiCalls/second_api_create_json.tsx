// //DEBUG_HERE_TEST DEBUG API CALL
export function secondApiCreateJson(step_number, selected_path_index, inputof_first_time_Path_Selected){

 console.log(
  step_number, selected_path_index, inputof_first_time_Path_Selected, 'at1 api '

 )
//     {
//         "step_number":1,
//         "selected_path_number":2,
//         "inputof_first_time_Path_Selected":  [
//           [[], [], [], []],
//           [
//             [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
//             [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
//             [2, 3, 4, 5, 6],
//             [6, 7, 8, 4, 1]
//           ],
//           [[], [], [], []]
//       ]
//   }

    const inputs = {
      "step_number": step_number,
      "selected_path_number": selected_path_index,
      "inputof_first_time_Path_Selected": inputof_first_time_Path_Selected,
    }
      
  
   return new Promise((resolve, reject) => {
        // fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/process', { //production URL
        fetch('http://127.0.0.1:5000/second_api/save_selected_path_json', { //local development URL
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': "application/json",
          },
          body: JSON.stringify(inputs), 
        }).then(
          res => res.json()
        ).then(
          data => {
            console.log({data});
            resolve(data);
          }
        ).catch((err) => {
          reject(err);
        });
      });
  
  
  
    //   RESPONSE  FILE SAVE TO JSON AND BELOW DATA
  
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