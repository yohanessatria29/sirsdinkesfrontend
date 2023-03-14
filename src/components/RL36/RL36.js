import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL36.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer, toast } from "react-toastify";
// import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
// import { RiDeleteBin5Fill, RiEdit2Fill } from "react-icons/ri";
// import { AiFillFileAdd } from "react-icons/ai";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";

const RL36 = () => {
  const [namaPropinsi, setNamaPropinsi] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear() - 1);
  const [dataRL, setDataRL] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionsrs, setOptionsRS] = useState([]);
  const [idkabkota, setIdKabKota] = useState("");
  const [idrs, setIdRS] = useState("");
  const tableRef = useRef(null);
  const [namafile, setNamaFile] = useState("");

  useEffect(() => {
    refreshToken();
    getDataKabkota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get("/apisirsadmin/token");
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      // getDataRS(decoded.rsId);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get("/apisirsadmin/token");
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getDataKabkota = async () => {
    try {
      const response = await axiosJWT.get("/apisirsadmin/kabkota");
      const kabkotaDetails = response.data.data.map((value) => {
        return value;
      });

      const results = [];
      kabkotaDetails.forEach((value) => {
        results.push({
          key: value.nama,
          value: value.id,
        });
      });
      // Update the options state
      setOptions([{ key: "Piih Kab/Kota", value: "" }, ...results]);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const searchRS = async (e) => {
    try {
      const responseRS = await axiosJWT.get(
        "/apisirsadmin/rumahsakit/" + e.target.value,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const DetailRS = responseRS.data.data.map((value) => {
        return value;
      });
      const resultsRS = [];

      DetailRS.forEach((value) => {
        resultsRS.push({
          key: value.RUMAH_SAKIT,
          value: value.Propinsi,
        });
      });
      // // Update the options state
      setIdKabKota(e.target.value);
      setOptionsRS([...resultsRS]);
    } catch (error) {
      if (error.response) {
        console.log(error);
      }
    }
  };

  const changeHandlerSingle = (event) => {
    setTahun(event.target.value);
  };

  const changeHandlerRS = (event) => {
    setIdRS(event.target.value);
  };

  const Cari = async (e) => {
    e.preventDefault();
    setSpinner(true);
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          koders: idrs,
          tahun: tahun,
        },
      };
      const results = await axiosJWT.get(
        "/apisirsadmin/rltigatitikenam",
        customConfig
      );

      const rlTigaTitikEnamDetails = results.data.data.map((value) => {
        return value.rl_tiga_titik_enam_details;
      });

      let dataRLTigaTitikEnamDetails = [];
      rlTigaTitikEnamDetails.forEach((element) => {
        element.forEach((value) => {
          dataRLTigaTitikEnamDetails.push(value);
        });
      });

      setDataRL(dataRLTigaTitikEnamDetails);
      setNamaFile("RL36_" + idrs);
      setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Profile Dinkes</h5>
              <div
                className="form-floating"
                style={{ width: "100%", display: "inline-block" }}
              >
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  value={namaPropinsi}
                  disabled={true}
                />
                <label htmlFor="floatingInput">Provinsi </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={Cari}>
                <h5 className="card-title h5">
                  Cari Rumah Sakit Dan Periode Laporan
                </h5>
                <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <select
                    name="kabkota"
                    typeof="select"
                    className="form-control"
                    id="floatingselect"
                    placeholder="Kab/Kota"
                    onChange={searchRS}
                  >
                    {options.map((option) => {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.key}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="floatingInput">Kab. Kota :</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <select
                    name="rumahsakit"
                    typeof="select"
                    className="form-control"
                    id="floatingselect"
                    placeholder="Rumah Sakit"
                    onChange={(e) => changeHandlerRS(e)}
                  >
                    <option value="">Pilih Rumah Sakit</option>
                    {optionsrs.map((option) => {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.key}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="floatingInput">Rumah Sakit :</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <input
                    name="tahun"
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder="Tahun"
                    value={tahun}
                    onChange={(e) => changeHandlerSingle(e)}
                  />
                  <label htmlFor="floatingInput">Tahun</label>
                </div>
                <div className="mt-3 mb-3">
                  <button type="submit" className="btn btn-outline-success">
                    <HiSaveAs /> Cari
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3 mb-3">
        <div className="col-md-12">
          {/* <Link
            to={`/rl36/tambah/`}
            style={{ textDecoration: "none", display: "flex" }}
          >
            <AiFillFileAdd
              size={30}
              style={{ color: "gray", cursor: "pointer" }}
            />
            <span style={{ color: "gray" }}>RL 3.6 Pembedahan</span>
          </Link> */}
          <div className="container" style={{ textAlign: "center" }}>
            {/* <h5>test</h5> */}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
          </div>
          <DownloadTableExcel
            filename={namafile}
            sheet="data RL 36"
            currentTableRef={tableRef.current}
          >
            <button> Export excel </button>
          </DownloadTableExcel>
          <Table
            className={style.rlTable}
            bordered
            responsive
            style={{ width: "100%" }}
            ref={tableRef}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "2%",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  No.
                </th>
                <th style={{ width: "20%", textAlign: "center" }}>
                  Jenis Spesialisasi
                </th>
                <th style={{ width: "10%", textAlign: "center" }}>Total</th>
                <th style={{ width: "10%", textAlign: "center" }}>Khusus</th>
                <th style={{ width: "10%", textAlign: "center" }}>Besar</th>
                <th style={{ width: "10%", textAlign: "center" }}>Sedang</th>
                <th style={{ width: "10%", textAlign: "center" }}>Kecil</th>
              </tr>
            </thead>
            <tbody>
              {dataRL.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <label htmlFor="">{index + 1}</label>
                    </td>
                    <td>
                      {/* <input
                        type="text"
                        name="jenisSpesialisasi"
                        className="form-control"
                        value={value.jenis_spesialisasi.nama}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.jenis_spesialisasi.nama}</label>
                    </td>
                    <td>
                      {/* <input
                        type="number"
                        name="Total"
                        className="form-control"
                        value={value.total}
                        // onChange={(e) => changeHandler(e, index)}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.total}</label>
                    </td>
                    <td>
                      {/* <input
                        type="text"
                        name="Khusus"
                        className="form-control"
                        value={value.khusus}
                        // onChange={(e) => changeHandler(e, index)}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.khusus}</label>
                    </td>
                    <td>
                      {/* <input
                        type="text"
                        name="Besar"
                        className="form-control"
                        value={value.besar}
                        // onChange={(e) => changeHandler(e, index)}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.besar}</label>
                    </td>
                    <td>
                      {/* <input
                        type="text"
                        name="Sedang"
                        className="form-control"
                        value={value.sedang}
                        // onChange={(e) => changeHandler(e, index)}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.sedang}</label>
                    </td>
                    <td>
                      {/* <input
                        type="text"
                        name="Kecil"
                        className="form-control"
                        value={value.kecil}
                        // onChange={(e) => changeHandler(e, index)}
                        disabled={true}
                      /> */}
                      <label htmlFor="">{value.kecil}</label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RL36;
