import React, { useState, useEffect } from "react";
import MyFooter from "../components/MyFooter";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { BsSearch } from "react-icons/bs";

export default function ShowAllPatientForHospital(props) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get("account");
  const [Contract, setContract] = useState(null);

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

  //get Contract
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
          window.alert("Only Ganache network is supported.");
          window.location.reload();
        }
      }
    };
    loadContract();
  }, [wEb3]);

  //get acount
  const [account, setAccount] = useState();
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await wEb3.web3.eth.getAccounts();
      setAccount(accounts);
    };
    getAccount();
  });

  //////////////////// Search Box //////////////////
  const [searchValue, setSearchValue] = useState("");

  const [Patientdata, setPatientData] = useState([]);

  ///Date At TABLE for Patients.
  const getAllPatients = async () => {
    if (Contract && account) {
      try {
        const data = await Contract.methods.get_all_Patients().call({ from: account });
        setPatientData(data);
      } catch (e) {
        console.error("Error fetching patients:", e);
      }
    }
  };

  useEffect(() => {
    getAllPatients();
  }, [Contract, account]); // Fetch patients only when Contract and account are available

  ////////////////////////////////////////////////

  return (
    <>
      <main>
        <section className="section container p-4 mt-4">
          <div className="mt-4 mb-4">
            <div className="forms">
              <div className="card overflow-auto">
                <div className="card-body">
                  <div className="row d-flex align-items-center">
                    <div className="col-xl-4">
                      <h1 className="card-title my-3">Registered Patient</h1>
                    </div>
                    <div className="col-xl-8">
                      <div className="d-flex">
                        <div className="input-group w-50">
                          <input
                            type="text"
                            placeholder="Search for doctor "
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="form-control"
                          />
                          <span className="input-group-text">
                            <BsSearch />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <table className="table table-borderless datatable m-0">
                    <thead>
                      <tr>
                        <th scope="col">Patient Name</th>
                        <th scope="col">Public Key</th>
                        <th scope="col">Hospital Address</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Age</th>
                        <th scope="col">Marital Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Patientdata.map((date) => {
                        if (date.hospital_addr == account) {
                          return (
                            <tr>
                              <th scope="row">{date.name}</th>
                              <td>{date.PatientAddress}</td>
                              <td>{date.hospital_addr}</td>
                              {/* <td className="d-none">{date.nationalAddress}</td> */}
                              <td>{date.phone}</td>
                              <td>{date.age}</td>
                              <td>{date.marital_status}</td>
                            </tr>
                          );
                        }
                      }).filter(
                        (date) =>
                          date !== undefined &&
                          (date.props.children[0].props.children
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                            date.props.children[1].props.children.includes(
                              searchValue
                            ) ||
                            date.props.children[2].props.children.includes(
                              searchValue
                            ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div>
        <MyFooter />
      </div>
    </>
  );
}
