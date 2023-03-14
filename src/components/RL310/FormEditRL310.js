import React, { useState, useEffect } from "react"
import axios from "axios"
import jwt_decode from 'jwt-decode'
import { useNavigate, useParams, Link } from "react-router-dom"
import style from './FormTambahRL310.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { IoArrowBack } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const FormEditRL310 = () => {
    const [tahun, setTahun] = useState('')
    const [namaRS, setNamaRS] = useState('')
    const [alamatRS, setAlamatRS] = useState('')
    const [namaPropinsi, setNamaPropinsi] = useState('')
    const [namaKabKota, setNamaKabKota] = useState('')
    const [jenisKegiatan, setJeniskegiatan] = useState('')
    const [jumlah, setJumlah] = useState('')
    const [no, setNo] = useState('')
    const [nama, setNama] = useState('')
    const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const navigate = useNavigate()
    const { id } = useParams();
    
    useEffect(() => {
        refreshToken()
        getRLTigaTitikTigaById();

        const date = new Date();
        setTahun(date.getFullYear() - 1)

    }, []);

    const refreshToken = async() => {
        try {
            const response = await axios.get('/apisirs/token')
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
            getDataRS(decoded.rsId)
        } catch (error) {
            if(error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async(config) => {
        const currentDate = new Date()
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('/apisirs/token')
            config.headers.Authorization = `Bearer ${response.data.accessToken}`
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
        }
        return config
    }, (error) => {
        return Promise.reject(error)
    })
    const changeHandlerSingle = (event) => {
        setTahun(event.target.value)
    }

    const changeHandler = (event, index) => {
        if(event.target.value === ""){
            event.target.value = 0
            event.target.select(event.target.value)
        }
        setJumlah(event.target.value)
    }
    const getDataRS = async (id) => {
        try {
            const response = await axiosJWT.get('/apisirs/rumahsakit/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            //console.log(response.data)
            setNamaRS(response.data.data[0].nama)
            setAlamatRS(response.data.data[0].alamat)
            setNamaPropinsi(response.data.data[0].propinsi.nama)
            setNamaKabKota(response.data.data[0].kabKota.nama)
        } catch (error) {
            
        }
    }
    const updateDataRLTigaTitikTiga = async (e) => {
        e.preventDefault();
        try {
            const customConfig = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
            const result = await axiosJWT.patch('/apisirs/rltigatitiksepuluhdetail/' + id, {
                no,
                nama,
                jumlah,
            }, customConfig);
            toast('Data Berhasil Diupdate', {
                position: toast.POSITION.TOP_RIGHT
            })
            setTimeout(() => {
                navigate('/rl310')
            }, 1000);
        } catch (error) {
            console.log(error)
            toast('Data Gagal Diupdate', {
                position: toast.POSITION.TOP_RIGHT
            })
        }
    };
    
    const getRLTigaTitikTigaById = async () => {
        // const response = await axios.get(`http://localhost:5001/rltigatitiktigadetail/${id}`);
        const response = await axiosJWT.get('/apisirs/rltigatitiksepuluhdetail/'+ id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setNama(response.data.data.jenis_kegiatan.nama);
         setNo(response.data.data.jenis_kegiatan.no);
        setJeniskegiatan(response.data.data.rl_tiga_titik_tiga_id);
        setJumlah(response.data.data.jumlah);
      //  console.log(response.data.data.jenis_kegiatan.no);
        
    };

    const preventPasteNegative = (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = parseFloat(clipboardData.getData('text'));
    
        if (pastedData < 0) {
            e.preventDefault();
        }
    }
    
    const preventMinus = (e) => {
        if (e.code === 'Minus') {
            e.preventDefault();
        }
    }
    const handleFocus = ((event) => {
        event.target.select()
    })

  return (
    <div className="container" style={{marginTop: "70px"}}>
    <form onSubmit={updateDataRLTigaTitikTiga}>
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title h5">Profile Fasyankes</h5>
                        <div className="form-floating" style={{width:"100%", display:"inline-block"}}>
                            <input type="text" className="form-control" id="floatingInput"
                                value={ namaRS } disabled={true}/>
                            <label htmlFor="floatingInput">Nama</label>
                        </div>
                        <div className="form-floating" style={{width:"100%", display:"inline-block"}}>
                            <input type="text" className="form-control" id="floatingInput"
                                value={ alamatRS} disabled={true}/>
                            <label htmlFor="floatingInput">Alamat</label>
                        </div>
                        <div className="form-floating" style={{width:"50%", display:"inline-block"}}>
                            <input type="text" className="form-control" id="floatingInput"
                                value={ namaPropinsi } disabled={true}/>
                            <label htmlFor="floatingInput">Provinsi </label>
                        </div>
                        <div className="form-floating" style={{width:"50%", display:"inline-block"}}>
                            <input type="text" className="form-control" id="floatingInput"
                                value={ namaKabKota } disabled={true}/>
                            <label htmlFor="floatingInput">Kab/Kota</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br></br>
        <Link to={`/rl310/`} style={{textDecoration: "none"}}>
                            <IoArrowBack size={30} style={{color:"gray",cursor: "pointer"}}/><span style={{color: "gray"}}></span>
                            <span style={{color: "gray"}}>RL 3.10 Pelayanan Khusus</span>
        </Link>
        <div className="row mt-3">
            <div className="col-md-12">
                <table className={style.rlTable}>
                    <thead>
                        <tr>
                            <th style={{"width": "10%"}}>No Kegiatan</th>
                            <th>Jenis Kegiatan</th>
                            <th style={{"width": "15%"}}>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>  
                        <tr>               
                                            <td><input name="no" type="text" className="form-control" id="floatingInput" 
                                        placeholder="No" value={no} onChange={e => changeHandler(e)} disabled={true} onFocus={handleFocus}/>
                                            </td>
                                            <td><input name="nama" type="text" className="form-control" id="floatingInput" 
                                        placeholder="Kegiatan" value={nama} onChange={e => changeHandler(e)} disabled={true} onFocus={handleFocus}/>
                                            </td>
                                            <td><div className="control">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={jumlah}
                                            onChange={(e) => changeHandler(e)}
                                            placeholder="Jumlah"
                                            min={0} onPaste={preventPasteNegative}
                                            onKeyPress={preventMinus}
                                            onFocus={handleFocus}
                                        />
                                    </div>
                                            </td>
                                   
                            </tr>
                    
                    </tbody>
                </table>
            </div>
        </div>
        <div className="mt-3 mb-3">
        <ToastContainer />
            <button type="submit" className="btn btn-outline-success"><HiSaveAs/> Update</button>
        </div>
    </form>
</div>
  )
}
export default FormEditRL310