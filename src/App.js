import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from "./components/Login/Login"
import NavigationBar from "./components/NavigationBar/NavigationBar"

// User
import FormUbahPassword from "./components/User/FormUbahPassword"

// RL 1.3
import RL13 from "./components/RL13/RL13.js"

// RL 3.1
import RL31 from "./components/RL31/RL31.js"

// RL 3.6
import RL36 from "./components/RL36/RL36.js";

// RL 3.9
import RL39 from "./components/RL39/RL39.js";

// RL 4b
import RL4B from "./components/RL4B/RL4B.js"

// RL 4b sebab
import RL4BSebab from "./components/RL4BSebab/RL4BSebab"

function App() {
  return (
    <BrowserRouter basename={''}>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="admin/beranda" element={<><NavigationBar/></>} />
        <Route path="/user/ubahpassword" element={<><NavigationBar/><FormUbahPassword/></>}/>

        <Route path="admin/rl13" element={<><NavigationBar/><RL13/></>}/>

        <Route path="admin/rl31" element={<><NavigationBar/><RL31/></>}/>
        
        <Route path="admin/rl36" element={<><NavigationBar/><RL36/></>}/>

        <Route path="admin/rl39" element={<><NavigationBar/><RL39/></>}/>

        <Route path="admin/rl4b" element={<><NavigationBar/><RL4B/></>}/>

        <Route path="admin/rl4bsebab" element={<><NavigationBar/><RL4BSebab/></>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
