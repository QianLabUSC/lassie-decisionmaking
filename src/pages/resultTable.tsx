// import * as React from 'react';
// import { useState, useEffect } from 'react';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';

// import {
//   query,
//   updateItemAccessTimeByCreateTime,
//   updateItemDeleteTimeByCreateTime
// } from '../dbHelper';
// import { DynamoDB } from 'aws-sdk/clients/all';

// function formatData(dbRow : DynamoDB.AttributeMap) {
//   const result : DDBRow = {
//     createTime: -1,
//     lastAccessTime: -1,
//     deleteTime: -1,
//     value: ''
//   };
//   for (const key in dbRow) {
//     const attr = dbRow[key];
//     if (attr.N) {
//       result[key] = parseInt(attr.N);
//     } else if (attr.S) {
//       result[key] = attr.S;
//     }
//   }
//   return result;
// }

// function toTimeString(epochTime : number) {
//   if (epochTime == -1) return '';
//   const date = new Date(epochTime);
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const day = date.getDate().toString().padStart(2, '0');
//   return `${year}/${month}/${day} ${date.toLocaleTimeString()}`;
// }

// export function ResultTable() {
//   const [rows, setRows] = useState<DDBRow[]>([]);
//   const loadData = () => {
//     query(function(err, data) {
//       if (err) {
//         console.log(err);
//         return;
//       }
//       console.log(data);
//       if (data.Items) {
//         setRows(data.Items.map(v => formatData(v)));
//       }
//     });
//   }

//   useEffect(() => {
//     loadData();
//   }, [])

//   const onDownloadClick = (idx : number) => {
//     const a = document.createElement('a');
//     const url = window.URL.createObjectURL(new Blob([rows[idx].value], { type: 'application/json' }));
//     a.download = `${rows[idx].createTime}.json`;
//     a.href = url;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     a.remove();
//     updateItemAccessTimeByCreateTime(rows[idx].createTime, function(err, data) {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       loadData();
//     });
//   };

//   const onDeleteClick = (idx : number) => {
//     updateItemDeleteTimeByCreateTime(rows[idx].createTime, function(err, data) {
//       if (err) {
//         console.error(err);
//         return
//       }
//       loadData();
//     })
//   }
    
//     return (
//       <Paper>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Create Time</TableCell>
//               <TableCell align="right">Last Access Time</TableCell>
//               <TableCell align="right">Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows.filter(row => row.deleteTime === -1).map((row, idx) => (
//               <TableRow key={row.createTime}>
//                 <TableCell component="th" scope="row">{toTimeString(row.createTime)}</TableCell>
//                 <TableCell align="right">{toTimeString(row.lastAccessTime)}</TableCell>
//                 <TableCell align="right">
//                   <span onClick={() => onDownloadClick(idx)} style={{
//                     cursor: 'pointer'
//                   }}>Download</span>
//                   <span onClick={() => onDeleteClick(idx)} style={{
//                     marginLeft: 10,
//                     cursor: 'pointer'
//                   }}>Delete</span>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>
//     );
// }