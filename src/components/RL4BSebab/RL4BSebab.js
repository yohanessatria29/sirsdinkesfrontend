import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL4BSebab.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
// import { RiDeleteBin5Fill, RiEdit2Fill } from "react-icons/ri";
// import { AiFillFileAdd } from "react-icons/ai";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";

const RL4BSebab = () => {
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
    // CariLastYear(new Date().getFullYear() - 1);
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
    setSpinner(true)
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
      const results = await axiosJWT.get("/apisirsadmin/rlempatbsebab", customConfig);

      // console.log(results.data.dataRL)
      const rlEmpatDetails = results.data.data.map((value) => {
        return value.rl_empat_b_sebab_details;
      });

      let datarlEmpatDetails = [];
      rlEmpatDetails.forEach((element) => {
        element.forEach((value) => {
          datarlEmpatDetails.push(value);
        });
      });

      setDataRL(datarlEmpatDetails);
      setSpinner(false)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <div className="row">
        <div className="col-md-6">
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
          <div className="container" style={{ textAlign: "center" }}>
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                      </div>
          <Table
            className={style.rlTable}
            bordered
            responsive
            style={{ width: "500%" }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  No.
                </th>
                <th
                  style={{
                    textAlign: "left",
                    wordBreak: "break-word",
                  }}
                >
                  GOLONGAN SEBAB PENYAKIT
                </th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 0 - 6hr Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 0 - 6hr Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 7 - 28hr Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 7 - 28hr Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 29hr - &lt; 1th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 29hr - &lt; 1th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 1th - 4th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 1th - 4th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 5th - 14th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 5th - 14th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 15th - 24th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 15th - 24th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 25th - 44th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 25th - 44th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 45th - 64th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR 45th - 64th Perempuan</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR &gt; 64th Laki-laki</th>
                <th>(JUMLAH) PASIEN GOLONGAN UMUR &gt; 64th Perempuan</th>
                <th>KASUS BARU LAKI-LAKI</th>
                <th>KASUS BARU PEREMPUAN</th>
                <th>JUMLAH KASUS BARU</th>
                <th>JUMLAH KUNJUNGAN</th>
              </tr>
            </thead>
            <tbody>
              {dataRL.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <label>{index + 1}</label>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <label>{value.jenis_golongan_sebab_penyakit.nama}</label>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_0_6hr_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_0_6hr_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_6_28hr_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_6_28hr_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_28hr_1th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_28hr_1th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_1_4th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_1_4th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_4_14th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_4_14th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_14_24th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_14_24th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_24_44th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_24_44th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_44_64th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_44_64th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_lebih_64th_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jmlh_pas_kasus_umur_sex_lebih_64th_p}
                        disabled
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.kasus_baru_l}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.kasus_baru_p}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jumlah_kasus_baru}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={value.jumlah_kunjungan}
                        disabled
                      />
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

export default RL4BSebab;
