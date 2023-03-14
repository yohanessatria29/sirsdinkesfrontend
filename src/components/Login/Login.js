import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import style from './Login.module.css'
import { BoxArrowDownRight} from "react-bootstrap-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import sirsImage from '../Images/sirsImage4.jpeg'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // const [msg, setMsg] = useState('')
    const navigate = useNavigate()

    const Auth = async(e) => {
        e.preventDefault()
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json'
                }
            } 
            const results = await axios.post('/apisirsadmin/login',{
                userName: email,
                password: password
            }, customConfig)
            // console.log(results.data)
            localStorage.setItem('name', results.data.data.name)
            navigate("admin/beranda")
        } catch (error) {
            if(error.response) {
                toast('User Name/Password Salah !!!', {
                    position: toast.POSITION.TOP_RIGHT
                })
                // setMsg(error.response.data.message)
                // console.log(error)
            }
        }
    }

    return (
        <div className={`container`}>
            <div className="row">
                <div className="col-md-12">
                    <div className={`row ${style.content}`}>
                        <div className="col-md-6">
                            <div>
                                <img
                                    src={sirsImage}
                                    className="img-fluid"
                                    alt=""
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="row align-items-center" style={{minHeight: "65vh"}}>
                                <div className="col-md-12">
                                    <h3 className="h3 mb-3"> Login</h3>
                                    <form onSubmit={ Auth }>
                                        <div className="form-floating mb-3">
                                            <input type="text" className="form-control" id="floatingInput" 
                                                value={email} onChange={(e) => setEmail(e.target.value)}/>
                                            <label htmlFor="floatingInput">User Name</label>
                                        </div>
                                        <div className="form-floating">
                                            <input type="password" className="form-control" id="floatingPassword" 
                                                value={password} onChange={(e) => setPassword(e.target.value)}/>
                                            <label htmlFor="floatingPassword">Password</label>
                                        </div>
                                        <div className="mt-3">
                                            <ToastContainer />
                                            <button className="btn btn-outline-success"><BoxArrowDownRight/> Login</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login