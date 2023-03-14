import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL39.module.css";
import { useNavigate, Link } from "react-router-dom";
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

const RL39 = () => {
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

  // const Cari = async (e) => {
  //   e.preventDefault();
  //   setSpinner(true);
  //   try {
  //     const customConfig = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       params: {
  //         koders: idrs,
  //         tahun: tahun,
  //       },
  //     };
  //     const results = await axiosJWT.get(
  //       "/apisirsadmin/rltigatitiksembilan",
  //       customConfig
  //     );

  //     const rlTigaTitikSembilanDetails = results.data.data.map((value) => {
  //       return value.rl_tiga_titik_sembilan_details;
  //     });

  //     let dataRLTigaTitikSembilanDetails = [];
  //     rlTigaTitikSembilanDetails.forEach((element) => {
  //       element.forEach((value) => {
  //         dataRLTigaTitikSembilanDetails.push(value);
  //       });
  //     });
  //     setDataRL(dataRLTigaTitikSembilanDetails);
  //     setNamaFile("RL39_" + idrs);
  //     setSpinner(false);
  //     // console.log(dataRLTigaTitikSembilanDetails)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const Cari = async (e) => {
    e.preventDefault();
    try {
      setSpinner(true);
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

      const results = await axiosJWT.get("/apisirsadmin/rltigatitiksembilan", customConfig);

      const rlTigaTitikSembilanDetails = results.data.data.map((value) => {
        return value.rl_tiga_titik_sembilan_details;
      });

      let dataRLTigaTitiksembilanDetails = [];
      rlTigaTitikSembilanDetails.forEach((element) => {
        element.forEach((value) => {
          dataRLTigaTitiksembilanDetails.push(value);
        });
      });

      let sortedProducts = dataRLTigaTitiksembilanDetails.sort((p1, p2) =>
        p1.jenis_tindakan_id > p2.jenis_tindakan_id ? 1 : -1
      );

      let groups = [];
      sortedProducts.reduce(function (res, value) {
        if (!res[value.group_jenis_tindakan.group_jenis_tindakan_header_id]) {
          res[value.group_jenis_tindakan.group_jenis_tindakan_header_id] = {
            groupId: value.group_jenis_tindakan.group_jenis_tindakan_header_id,
            groupNama:
              value.group_jenis_tindakan.group_jenis_tindakan_header.nama,
            jumlah: 0,
          };
          groups.push(
            res[value.group_jenis_tindakan.group_jenis_tindakan_header_id]
          );
        }
        res[value.group_jenis_tindakan.group_jenis_tindakan_header_id].jumlah +=
          value.jumlah;
        return res;
      }, {});

      let data = [];
      groups.forEach((element) => {
        if (element.groupId != null) {
          const filterData = sortedProducts.filter((value, index) => {
            return (
              value.group_jenis_tindakan.group_jenis_tindakan_header_id ===
              element.groupId
            );
          });
          data.push({
            groupNo: element.groupId,
            groupNama: element.groupNama,
            details: filterData,
            subTotal: element.jumlah,
          });
        }
      });
      setDataRL(data);
      setSpinner(false)
    } catch (error) {
      // toast("Get Data Error", {
      //   position: toast.POSITION.TOP_RIGHT,
      // });
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
            responsive
            bordered
            // style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ width: "5%" }}>No.</th>
                <th style={{ width: "40%" }}>Jenis Tindakan</th>
                <th style={{ width: "50%" }}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
            {
                // eslint-disable-next-line
                dataRL.map((value, index) => {
                  if (value.groupNama != null) {
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          {value.groupNo === 9 &&
                            <td>-</td>
                          }
                          {value.groupNo !== 9 &&
                            <td>{value.groupNo}</td>
                          }
                          <td style={{ textAlign: "left" }}>
                            {value.groupNama}
                          </td>
                          <td>{value.subTotal}</td>
                        </tr>
                        {value.details.map((value2, index2) => {
                          return (
                            <tr key={index2}>
                              <td>{value2.group_jenis_tindakan.no}</td>
                              {/* <td> */}
                                {/* <ToastContainer /> */}
                                {/* <RiDeleteBin5Fill
                                  size={20}
                                  onClick={(e) =>
                                    Delete(value2.id, value2.tahun)
                                  }
                                  style={{
                                    color: "gray",
                                    cursor: "pointer",
                                    marginRight: "5px",
                                  }}
                                /> */}
                                {/* {value2.group_jenis_tindakan.id !== 41 &&
                                  <Link to={`/rl39/ubah/${value2.id}`}>
                                    <RiEdit2Fill
                                      size={20}
                                      style={{ color: "gray", cursor: "pointer" }}
                                    />
                                  </Link>
                                } */}
                              {/* </td> */}
                              <td style={{ textAlign: "left" }}>
                                &emsp;{value2.group_jenis_tindakan.nama}
                              </td>
                              <td>{value2.jumlah}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else if (value.groupNama == null) {
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            {value.details[0].nama}
                          </td>
                          <td>{value.details[0].nilai}</td>
                        </tr>
                      </React.Fragment>
                    );
                  }
                })
              }
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RL39;
