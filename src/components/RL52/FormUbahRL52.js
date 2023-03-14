import React, { useState, useEffect } from "react"
import axios from "axios"
import jwt_decode from 'jwt-decode'
import { useNavigate, useParams, Link } from "react-router-dom"
import style from './FormTambahRL52.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { IoArrowBack } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from 'react-bootstrap/Spinner'

export const FormUbahRL52 = () => {
    const [tahun, setTahun] = useState('')
    // const [bulan, setBulan] = useState('')
    const [namaRS, setNamaRS] = useState('')
    const [alamatRS, setAlamatRS] = useState('')
    const [namaPropinsi, setNamaPropinsi] = useState('')
    const [namaKabKota, setNamaKabKota] = useState('')
    // const [jenisKegiatan, setJeniskegiatan] = useState('')
    const [jumlah, setJumlah] = useState('')
    // const [no, setNo] = useState('')
    const [nama, setNama] = useState('')
    // const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const navigate = useNavigate()
    const { id } = useParams();

    const [buttonStatus, setButtonStatus] = useState(false)
    const [spinner, setSpinner]= useState(false)
    
    useEffect(() => {
        refreshToken()
        getRLLimaTitikDuaById();

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // let newDataRL = [...dataRL]
        const name = event.target.name
        if (name === 'jumlah') {
            if(event.target.value === ''){
                    
                event.target.value = 0
                event.target.select(event.target.value)
                }
            setJumlah(parseInt(event.target.value))
        } 
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
    const updateDataRLLimaTitikDua = async (e) => {
        e.preventDefault();
        setSpinner(true)
        setButtonStatus(true)
        try {
            const customConfig = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
            await axiosJWT.patch('/apisirs/rllimatitikduadetail/' + id, {
                jumlah,
            }, customConfig);
            setSpinner(false)
            toast('Data Berhasil Diupdate', {
                position: toast.POSITION.TOP_RIGHT
            })
            setTimeout(() => {
                navigate('/rl52')
            }, 1000);
        } catch (error) {
            console.log(error)
            toast('Data Gagal Diupdate', {
                position: toast.POSITION.TOP_RIGHT
            })
            setButtonStatus(false)
            setSpinner(false)
        }
    };

    const getRLLimaTitikDuaById = async () => {
        setSpinner(true)
        const response = await axiosJWT.get('/apisirs/rllimatitikduadetail/'+ id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setNama(response.data.data.jenis_kegiatan.nama);
        // setNo(response.data.data.jenis_kegiatan.id);
        // setJeniskegiatan(response.data.data.rl_lima_titik_dua_id);
        setJumlah(response.data.data.jumlah);
        setTahun(response.data.data.tahun);
        // console.log(response);

        if((tahun.substring(5,7)) === '01'){
            // setBulan('Januari')
        } else if((tahun.substring(5,7)) === '02'){
            // setBulan('Februari')
        } else if((tahun.substring(5,7)) === '03'){
            // setBulan('Maret')
        } else if((tahun.substring(5,7)) === '04'){
            // setBulan('April')
        } else if((tahun.substring(5,7)) === '05'){
            // setBulan('Mei')
        } else if((tahun.substring(5,7)) === '06'){
            // setBulan('Juni')
        } else if((tahun.substring(5,7)) === '07'){
            // setBulan('Juli')
        } else if((tahun.substring(5,7)) === '08'){
            // setBulan('Agustus')
        } else if((tahun.substring(5,7)) === '09'){
            // setBulan('September')
        } else if((tahun.substring(5,7)) === '10'){
            // setBulan('Oktober')
        } else if((tahun.substring(5,7)) === '11'){
            // setBulan('November')
        } else if((tahun.substring(5,7)) === '12'){
            // setBulan('Desember')
        } 
        setSpinner(false)
    }

    const preventPasteNegative= (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = parseFloat(clipboardData.getData('text'));

        if(pastedData <0){
            e.preventDefault();
        }
    }

    const preventMinus = (e) => {
        if(e.code === 'Minus'){
            e.preventDefault();
        }
    }

    const handleFocus = ((event) => {
        event.target.select()
    })

    const maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
            object.target.value = object.target.value.slice(0, object.target.maxLength)
        }
    }


    return (
        <div className="container" style={{marginTop: "70px"}}>
            <form onSubmit={updateDataRLLimaTitikDua}>
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
                                        value= { namaKabKota } disabled={true}/>
                                    <label htmlFor="floatingInput">Kab/Kota</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title h5">Periode Laporan</h5>
                                    <div className="form-floating" style={{width:"100%", display:"inline-block"}}>
                                        <input name="tahun" type="text" className="form-control" id="floatingInput" 
                                            placeholder="Tahun" value={tahun.substring(0,4)} onChange={e => changeHandlerSingle(e)} disabled={true}/>
                                        <label htmlFor="floatingInput">Tahun</label>
                                    </div>
                                    <div className="form-floating" style={{width:"100%", display:"inline-block"}}>
                                        <input name="bulan" type="text" className="form-control" id="floatingInput" 
                                            placeholder="bulan" value={tahun.substring(5,7)} onChange={e => changeHandlerSingle(e)} disabled={true}/>
                                        <label htmlFor="floatingInput">Bulan</label>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-3 mb-3">
                    <div className="col-md-12">
                        <Link to={`/rl52/`} style={{textDecoration: "none"}}>
                            <IoArrowBack size={30} style={{color:"gray",cursor: "pointer"}}/>
                            <span style={{color: "gray"}}>Ubah data RL 5.2 -  Kunjungan Rawat Jalan</span>
                        </Link>
                        <div className="container" style={{ textAlign: "center" }}>
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        </div>
                        <table className={style.rlTable}>
                            <thead>
                                <tr>
                                    <th style={{"width": "5%"}}>No.</th>
                                    <th style={{"width": "40%"}}>Jenis Kegiatan</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key={id}>
                                    <td>
                                        <input type='text' name='id' className="form-control" value="1" disabled={true}/>
                                    </td>
                                    <td>
                                        <input type="text" name="jenisKegiatan" className="form-control" value={nama} disabled={true} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" onFocus={handleFocus} maxLength={7} onInput={(e) => maxLengthCheck(e)}  name="jumlah" className="form-control" value={jumlah} 
                                            onChange={e => changeHandler(e)} onPaste={preventPasteNegative} onKeyPress={preventMinus} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-3 mb-3">
                    <ToastContainer />
                    <button type="submit" disabled={buttonStatus} className="btn btn-outline-success"><HiSaveAs/> Update</button>
                </div>
            </form>
        </div>
    )

}

export default FormUbahRL52