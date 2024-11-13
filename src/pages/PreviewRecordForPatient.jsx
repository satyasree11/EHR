import React, { useState } from "react";
import MyFooter from "../components/MyFooter";
import { BsArrowLeft, BsBackspaceFill } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect } from "react";

export default function PreviewRecordForPatient() {
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
    // Load contract
  useEffect(() => {
    const loadContract = async () => {
      if (wEb3.web3) {
        try {
          const contractFile = await fetch("/contracts/MedRecChain.json");
          const contractData = await contractFile.json();
          const networkId = await wEb3.web3.eth.net.getId();
          const networkInfo = contractData.networks[networkId];

          if (networkInfo) {
            const contract = new wEb3.web3.eth.Contract(
              contractData.abi,
              networkInfo.address
            );
            setContract(contract);
          } else {
            alert("This contract is not deployed on the current network.");
            console.error(`Network ID: ${networkId}`);
          }
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      }
    };

    if (wEb3.web3) {
      loadContract();
    }
  }, [wEb3]);

  /////////////

  const [RecordDate, setRecordDate] = useState({});

   useEffect(() => {
    const getRecordDetails = async () => {
      if (Contract) {
        try {
          const records = await Contract.methods
            .See_Record_for_Patient()
            .call({ from: pat });

          // Find the record matching the CID
          const record = records.find((rec) => rec.hex_ipfs === cid);
          if (record) {
            setRecordDate(record);
          } else {
            console.warn("No matching record found for the given CID.");
          }
        } catch (error) {
          console.error("Error fetching records:", error);
        }
      }
    };

    getRecordDetails();
  }, [Contract, pat, cid]);

  // --------- Go back function --------
  const goBack = () => {
    // navigate(-1);
    window.location.replace(`/PatientRecords?account=${pat}`);
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
                          <div className="forms ">
                            <label className="" htmlFor="doctorPublicKey">
                              Record Data
                            </label>

                            <div className=" card" id=" file">
                              <embed
                                src={`http://127.0.0.1:9090/ipfs/${cid}?filename=${cid}`}
                                style={{
                                  height: "350px",
                                  width: "100%",
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
