import React, { useState } from "react";
import MyFooter from "../components/MyFooter";
import { BsArrowLeft, BsBackspaceFill } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect } from "react";

export default function PreviewRecordForDoctor() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const doc = searchParams.get("Doctor");
  const pat = searchParams.get("Patient");
  const cid = searchParams.get("CID");

  const [wEb3, setwEb3] = useState({
    provider: null,
    web3: null,
  });

  const providerChanged = (provider) => {
    provider.on("chainChanged", (_) => window.location.reload());
  };
  const accountsChanged = (provider) => {
    provider.on("accountsChanged", (_) => window.location.replace("/"));
  };

  //get WEB3
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        providerChanged(provider);
        accountsChanged(provider);
        setwEb3({
          provider,
          web3: new Web3(provider),
        });
      }
    };
    loadProvider();
  }, []);

  const [Contract, setContract] = useState(null);

  ///// get Contract
  
  // Load contract after web3 provider is available
  useEffect(() => {
    const loadContract = async () => {
      if (wEb3.web3) {
        const contractFile = await fetch("/contracts/MedRecChain.json");
        const contractData = await contractFile.json();
        const networkId = await wEb3.web3.eth.net.getId();
        const networkData = contractData.networks[networkId];

        if (networkData) {
          const abi = contractData.abi;
          const address = networkData.address;
          const contract = new wEb3.web3.eth.Contract(abi, address);
          setContract(contract);
        } else {
          window.alert("Only ganache network is supported");
          window.location.reload();
        }
      }
    };

    loadContract();
  }, [wEb3]);

  /////////////

  const [RecordDate, setRecordDate] = useState({});

   useEffect(() => {
    const getAllRecordDates = async () => {
      if (Contract && pat) {
        try {
          const date = await Contract.methods.See_Record_for_Patient().call({ from: pat });
          console.log(date);
          const record = date.find((record) => record.hex_ipfs === cid);
          if (record) {
            setRecordDate(record);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    getAllRecordDates();
  }, [Contract, pat, cid]);

  // --------- Go back function --------
  const goBack = () => {
    // navigate(-1);
    window.location.replace(
      `/PatientRecordsForDoctor?Doctor=${doc}&Patient=${pat}`
    );
  };

  ////////////////////////

  return (
    <>
      <main className="main mb-5">
        <section className="section dashboard">
          <button className="mx-5 mb-0 mt-4 py-2 px-4 rounded" onClick={goBack}>
            <i>
              <BsArrowLeft /> Go Back
            </i>
          </button>
          <div className="pb-2 mx-auto w-75">
            <div className="forms">
              <div className="card requests bg-secondary bg-opacity-10">
                <div className="card-body ">
                  <div className="row">
                    <div className="col-7">
                      <h1 className="card-title">Record Information</h1>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-6">
                      <div className="card-body text-muted opacity-75">
                        <div className="form-outline mb-4">
                          <label className="" htmlFor="category">
                            Category
                          </label>
                          <input
                            name="category"
                            type="text"
                            id="category"
                            className="form-control form-control-lg"
                            value={RecordDate.category}
                            disabled
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="" htmlFor="recordName">
                            Record Name
                          </label>
                          <input
                            name="recordName"
                            type="text"
                            id="recordName"
                            className="form-control form-control-lg"
                            value={RecordDate.rec_name}
                            disabled
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="" htmlFor="notes">
                            Notes for Patient
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            required="required"
                            className="form-control form-control-lg"
                            style={{
                              width: "100%",
                              height: "100px",
                              overflow: "auto",
                            }}
                            value={RecordDate.notes}
                            disabled
                          />
                        </div>

                        <div className="form-outline mb-4">
                          <label className="" htmlFor="date">
                            Date
                          </label>
                          <input
                            name="date"
                            type="date"
                            id="date"
                            className="form-control form-control-lg"
                            value={RecordDate.Created_at}
                            disabled
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="" htmlFor="patientPublicKey">
                            Patient Public Key
                          </label>
                          <input
                            name="patientPublicKey"
                            type="text"
                            id="patientPublicKey"
                            className="form-control form-control-lg"
                            value={RecordDate.patient_addr}
                            disabled
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="" htmlFor="doctorPublicKey">
                            Doctor Public Key
                          </label>
                          <input
                            name="doctorPublicKey"
                            type="text"
                            id="doctorPublicKey"
                            className="form-control form-control-lg"
                            value={RecordDate.doctor_addr}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-6">
                      <div className="section dashboard">
                        <div className="fs-6 text-muted ms-4 mt-3 container">
                          <div className="forms pe-5 ">
                            <label className="" htmlFor="doctorPublicKey">
                              Record Data
                            </label>

                            <div className="card " id="file">
                              <embed
                                src={`http://127.0.0.1:9090/ipfs/${cid}?filename=${cid}`}
                                style={{
                                  minHeight: "450px",
                                  width: "100%",
                                  borderRadius: "5px",
                                  
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MyFooter />
    </>
  );
}
