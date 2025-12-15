import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
function App() {
  const [dataa, setDataa] = useState([]);
  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/comments')
      .then((res, req) => {
        console.log(res.data);

        setDataa(res.data)

      })

  },[]);

  return (
    <>

      <table>
        <thead>
          <th>postId</th>
          <th>id</th>
          <th>name</th>
          <th>e-mail</th>
          <th>body</th>

        </thead>

        <tbody>
          {dataa.map((item,index)=>{
            return(
              <tr key={index}>
                <td>{item.id}</td>
              </tr>
            )
          }) }
        </tbody>

      </table>
    </>
  );
}

export default App;
