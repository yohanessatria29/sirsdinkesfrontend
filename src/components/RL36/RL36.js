import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL36.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
import { RiDeleteBin5Fill, RiEdit2Fill } from "react-icons/ri";
import { AiFillFileAdd } from "react-icons/ai";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { Typeahead } from "react-bootstrap-typeahead";
import Select from "react-select";

const RL36 = () => {
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
  const [namaRS, setNamaRS] = useState("");
  const [namakabkota, setKabKota] = useState("");
  const [statusValidasi, setStatusValidasi] = useState({
    value: 3,
    label: "Belum divalidasi",
  });
  const [statusValidasiId, setStatusValidasiId] = useState(3);
  const [optionStatusValidasi, setOptionStatusValidasi] = useState([]);
  const [catatan, setCatatan] = useState(" ");
  const [buttonStatus, setButtonStatus] = useState(true);
  const [statusDataValidasi, setStatusDataValidasi] = useState();
  const [kategoriUser, setKategoriUser] = useState();
  const [Buttonsearch, setButtonsearch] = useState(true);

  useEffect(() => {
    refreshToken();
    getDataKabkota();
    getStatusValidasi();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get("/apisirsadmin/token");
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      setKategoriUser(decoded.jenis_user_id);
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

  const getStatusValidasi = async () => {
    try {
      const response = await axios.get("/apisirsadmin/statusvalidasi");
      const statusValidasiTemplate = response.data.data.map((value, index) => {
        return {
          value: value.id,
          label: value.nama,
        };
      });
      setOptionStatusValidasi(statusValidasiTemplate);
    } catch (error) {
      console.log(error);
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
          kelas: value.KLS_RS,
        });
      });

      // // Update the options state
      setIdKabKota(e.target.value);
      setOptionsRS([...resultsRS]);
      setKabKota(e.target.options[e.target.selectedIndex].text);
    } catch (error) {
      if (error.response) {
        console.log(error);
      }
    }
  };

  const changeHandlerSingle = (event) => {
    setTahun(event.target.value);
  };

  const changeHandlerCatatan = (event) => {
    setCatatan(event.target.value);
  };

  const changeHandlerRS = (event) => {
    setIdRS(event.target.value);
    setButtonsearch(false);
  };

  const changeHandlerStatusValidasi = (selectedOption) => {
    setStatusValidasiId(parseInt(selectedOption.value));
    setStatusValidasi(selectedOption);
    // console.log(statusValidasiId)
  };

  const Validasi = async (e) => {
    e.preventDefault();
    setSpinner(true);
    let date = tahun + "-01-01";

    if (statusValidasiId === 3) {
      alert("Silahkan pilih status validasi terlebih dahulu");
      setSpinner(false);
    } else {
      if (statusValidasiId === 2 && catatan === "") {
        alert("Silahkan isi catatan apabila laporan tidak valid");
        setSpinner(false);
      } else if (idrs === "") {
        alert("Silahkan pilih rumah sakit");
        setSpinner(false);
      } else {
        try {
          const customConfig = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              rsid: idrs,
              rlid: 6,
              tahun: date,
            },
          };
          const results = await axiosJWT.get(
            "/apisirsadmin/validasi",
            customConfig
          );

          if (results.data.data == null) {
          } else {
            setStatusDataValidasi(results.data.data.id);
          }
        } catch (error) {
          console.log(error);
        }

        if (statusDataValidasi == null) {
          try {
            const customConfig = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            };
            const result = await axiosJWT.post(
              "/apisirsadmin/validasi",
              {
                rsId: idrs,
                rlId: 6,
                tahun: date,
                statusValidasiId: statusValidasiId,
                catatan: catatan,
              },
              customConfig
            );
            // console.log(result.data)
            setSpinner(false);
            toast("Data Berhasil Disimpan", {
              position: toast.POSITION.TOP_RIGHT,
            });
          } catch (error) {
            toast(
              `Data tidak bisa disimpan karena ,${error.response.data.message}`,
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
            setSpinner(false);
          }
        } else {
          try {
            const customConfig = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            };
            await axiosJWT.patch(
              "/apisirsadmin/validasi/" + statusDataValidasi,
              {
                statusValidasiId: statusValidasiId,
                catatan: catatan,
              },
              customConfig
            );
            setSpinner(false);
            toast("Data Berhasil Diupdate", {
              position: toast.POSITION.TOP_RIGHT,
            });
          } catch (error) {
            console.log(error);
            toast("Data Gagal Diupdate", {
              position: toast.POSITION.TOP_RIGHT,
            });
            setButtonStatus(false);
            setSpinner(false);
          }
        }

        getDataStatusValidasi();
      }
    }
  };

  const getDataStatusValidasi = async () => {
    // e.preventDefault();
    let date = tahun + "-01-01";

    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          rsid: idrs,
          rlid: 6,
          tahun: date,
        },
      };
      const results = await axiosJWT.get(
        "/apisirsadmin/validasi",
        customConfig
      );

      if (results.data.data == null) {
        if (kategoriUser === 3) {
          setButtonStatus(false);
        }
        // setStatusDataValidasi()
        setStatusValidasi({ value: 3, label: "Belum divalidasi" });
      } else {
        setStatusValidasi({
          value: results.data.data.status_validasi.id,
          label: results.data.data.status_validasi.nama,
        });
        setCatatan(results.data.data.catatan);
        if (kategoriUser === 3) {
          setButtonStatus(false);
        }
        setStatusDataValidasi(results.data.data.id);
        // alert('hi')
      }
      // console.log(results)
    } catch (error) {
      console.log(error);
    }
  };

  const Cari = async (e) => {
    e.preventDefault();
    setSpinner(true);
    if (idrs !== "") {
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
        setNamaRS(results.data.dataRS.RUMAH_SAKIT);
        // setKabKota(results.)
      } catch (error) {
        console.log(error);
      }
      getDataStatusValidasi();
    } else {
      toast("Filter Tidak Boleh Kosong...", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Validasi RL 3.6</h5>
              <form onSubmit={Validasi}>
                <Select
                  options={optionStatusValidasi}
                  className="form-control"
                  name="status_validasi_id"
                  id="status_validasi_id"
                  onChange={changeHandlerStatusValidasi}
                  value={statusValidasi}
                  isDisabled={buttonStatus}
                />
                <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <input
                    name="catatan"
                    type="text"
                    className="form-control"
                    id="floatingInputCatatan"
                    placeholder="catatan"
                    value={catatan}
                    onChange={(e) => changeHandlerCatatan(e)}
                    disabled={buttonStatus}
                  />
                  <label htmlFor="floatingInputCatatan">Catatan :</label>
                </div>
                <div className="mt-3">
                  <ToastContainer />
                  <button
                    type="submit"
                    disabled={buttonStatus}
                    className="btn btn-outline-success"
                    hidden={buttonStatus}
                  >
                    <HiSaveAs size={20} /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Filter RL 3.6</h5>
              <form onSubmit={Cari}>
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-12">
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
                              <option
                                key={option.value}
                                name={option.key}
                                value={option.value}
                              >
                                {option.key}
                              </option>
                            );
                          })}
                        </select>
                        <label htmlFor="floatingInput">Kab. Kota :</label>
                      </div>
                    </div>

                    <div className="col-md-8">
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
                              <option
                                key={option.value}
                                value={option.value}
                                kelas={option.kelas}
                              >
                                {option.key}
                              </option>
                            );
                          })}
                        </select>
                        <label htmlFor="floatingInput">Rumah Sakit :</label>
                      </div>
                    </div>

                    <div className="col-md-4">
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
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="submit"
                    disabled={Buttonsearch}
                    className="btn btn-outline-success"
                    hidden={Buttonsearch}
                  >
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
          <DownloadTableExcel
            filename={namafile}
            sheet="data RL 36"
            currentTableRef={tableRef.current}
          >
            <button className="btn btn-outline-success mb-2">
              Export Excel
            </button>
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
                <th style={{ width: "10%" }}>RL</th>
                <th style={{ width: "10%" }}>Nama RS</th>
                <th style={{ width: "10%" }}>Tahun</th>
                <th style={{ width: "10%" }}>Kab/Kota</th>
                <th style={{ width: "10%" }}>Jenis Spesialisasi</th>
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
                    <td>RL 3.6 </td>
                    <td>{namaRS}</td>
                    <td>{value.tahun}</td>
                    <td>{namakabkota}</td>
                    <td>
                      <label htmlFor="">{value.jenis_spesialisasi.nama}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.total}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.khusus}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.besar}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.sedang}</label>
                    </td>
                    <td>
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
