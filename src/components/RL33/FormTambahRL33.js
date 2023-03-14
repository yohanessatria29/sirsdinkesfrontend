import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { Link, useNavigate } from 'react-router-dom'
import style from './FormTambahRL33.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { IoArrowBack } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import { Link } from 'react-router-dom'

const FormTambahRL33 = () => {
    const [tahun, setTahun] = useState('')
    const [namaRS, setNamaRS] = useState('')
    const [alamatRS, setAlamatRS] = useState('')
    const [namaPropinsi, setNamaPropinsi] = useState('')
    const [namaKabKota, setNamaKabKota] = useState('')
    const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        refreshToken()
        getRLTigaTitikTigaTemplate()
        const date = new Date();
        setTahun(date.getFullYear() - 1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

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

    const getDataRS = async (id) => {
        try {
            const response = await axiosJWT.get('/apisirs/rumahsakit/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setNamaRS(response.data.data[0].nama)
            setAlamatRS(response.data.data[0].alamat)
            setNamaPropinsi(response.data.data[0].propinsi.nama)
            setNamaKabKota(response.data.data[0].kabKota.nama)
        } catch (error) {
            
        }
    }
 
    const getRLTigaTitikTigaTemplate = async() => {
        try {
            const response = await axiosJWT.get('/apisirs/jeniskegiatan?rlid=3', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            const rlTemplate = response.data.data.map((value, index) => {
                return {
                    id: value.id,
                    kodeProvinsi: 0,
                    kabKota: 0,
                    kodeRS: 0,
                    namaRS: 0,
                    tahun: 0,
                    no: value.no,
                    jenisKegiatan: value.nama,
                    jumlah: 0,
                    disabledInput: true,
                    checked: false
                }
            })
            setDataRL(rlTemplate)
        } catch (error) {
            
        }
    }

    const changeHandlerSingle = (event) => {
        setTahun(event.target.value)
    }

    const changeHandler = (event, index) => {
        let newDataRL = [...dataRL]
        const name = event.target.name
        if (name === 'check') {
            if (event.target.checked === true) {
                newDataRL[index].disabledInput = false
            } else if (event.target.checked === false) {
                newDataRL[index].disabledInput = true
            }
            newDataRL[index].checked = event.target.checked
        } else if (name === 'no') {
            if (event.target.value === '') {
                event.target.value = 0
                event.target.select(event.target.value)
              }
            newDataRL[index].no = event.target.value
        } else if (name === 'jenisKegiatan') {
            if (event.target.value === '') {
                event.target.value = 0
                event.target.select(event.target.value)
              }
            newDataRL[index].jenisKegiatan = event.target.value
        } else if (name === 'jumlah') {
            if (event.target.value === '') {
                event.target.value = 0
                event.target.select(event.target.value)
              }
            newDataRL[index].jumlah = event.target.value
        } 
        setDataRL(newDataRL)
    }

    const Simpan = async (e) => {
        e.preventDefault()
        try {
            const dataRLArray = dataRL.filter((value) => {
                return value.checked === true
            }).map((value, index) => {
                return {
                    "jenisKegiatanId": parseInt(value.id),
                    "jumlah": parseInt(value.jumlah)
                }
            })

            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
            const result = await axiosJWT.post('/apisirs/rltigatitiktiga',{
                tahun: parseInt(tahun),
                data: dataRLArray
            }, customConfig);
            // console.log(result.data)
            toast('Data Berhasil Disimpan', {
                position: toast.POSITION.TOP_RIGHT
            })
            setTimeout(() => {
                navigate('/rl33')
            }, 1000);
        } catch (error) {
            toast(`Data tidak bisa disimpan karena ,${error.response.data.message}`, {
                position: toast.POSITION.TOP_RIGHT
            })
        }
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

    const maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
          object.target.value = object.target.value.slice(0, object.target.maxLength)
        }
      }

    return (
        <div className="container" style={{marginTop: "70px"}}>
            <form onSubmit={Simpan}>
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
                                        placeholder="Tahun" value={tahun} disabled={true}/>
                                    <label htmlFor="floatingInput">Tahun</label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 mb-3">
                        {/* <Link to='/rl33'className="btn btn-outline-success">Lihat Data RL 3.3</Link> */}
                </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-md-12">
                    <Link to={`/rl33/`} style={{textDecoration: "none"}}>
                            <IoArrowBack size={30} style={{color:"gray",cursor: "pointer"}}/><span style={{color: "gray"}}>RL 3.3 Gigi Mulut</span>
                        </Link>
                        <table className={style.rlTable}>
                            <thead>
                                <tr>
                                    <th style={{"width": "4%"}}>No.</th>
                                    <th style={{"width": "3%"}}></th>
                                    <th style={{"width": "4%"}}>No Kegiatan</th>
                                    <th style={{"width": "20%"}}>Jenis Kegiatan</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                            {dataRL.map((value, index) => {
                                if (value.id === 402){
                                    return (
                                        <tr key={value.id}>
                                            <td>
                                                <input 
                                                type='text' 
                                                name='id' 
                                                className="form-control" 
                                                value={index+1} 
                                                disabled={true}/> 
                                            </td>
                                            <td style={{textAlign: "center", verticalAlign: "middle"}}>
                                                <input 
                                                type="checkbox" 
                                                name='check' 
                                                className="form-check-input" 
                                                onChange={e => changeHandler(e, index)} 
                                                checked={value.checked}/>
                                            </td>
                                            <td>
                                                <input 
                                                type="text" 
                                                name="no" 
                                                className="form-control" 
                                                value={value.no} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input 
                                                type="text" 
                                                name="jenisKegiatan" 
                                                className="form-control" 
                                                value={value.jenisKegiatan} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input 
                                                type="number" 
                                                min='0' 
                                                maxLength={7} 
                                                onInput={(e) => maxLengthCheck(e)} 
                                                onPaste={preventPasteNegative} 
                                                onKeyPress={preventMinus} 
                                                name="jumlah" 
                                                className="form-control" 
                                                value={value.jumlah} 
                                                onChange={e => changeHandler(e, index)} 
                                                disabled={value.disabledInput} />
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    return (
                                        <tr key={value.id}>
                                            <td>
                                                <input 
                                                type='text' 
                                                name='id' 
                                                className="form-control" 
                                                value={index+1} 
                                                disabled={true}/> 
                                            </td>
                                            <td style={{textAlign: "center", verticalAlign: "middle"}}>
                                                <input 
                                                type="checkbox" 
                                                name='check' 
                                                className="form-check-input" 
                                                onChange={e => changeHandler(e, index)} 
                                                checked={value.checked}/>
                                            </td>
                                            <td>
                                                <input 
                                                type="text" 
                                                name="no" 
                                                className="form-control" 
                                                value={value.no} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input 
                                                type="text" 
                                                name="jenisKegiatan" 
                                                className="form-control" 
                                                value={value.jenisKegiatan} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input 
                                                type="number" 
                                                min='0' 
                                                maxLength={7} 
                                                onInput={(e) => maxLengthCheck(e)} 
                                                onPaste={preventPasteNegative} 
                                                onKeyPress={preventMinus} 
                                                name="jumlah" 
                                                className="form-control" 
                                                value={value.jumlah} 
                                                onChange={e => changeHandler(e, index)} 
                                                disabled={value.disabledInput} />
                                            </td>
                                        </tr>
                                    );
                                }
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-3 mb-3">
                    <ToastContainer />
                    <button type="submit" className="btn btn-outline-success"><HiSaveAs/> Simpan</button>
                </div>
            </form>
        </div>
    )
}

export default FormTambahRL33