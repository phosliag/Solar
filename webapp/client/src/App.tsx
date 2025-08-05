import "./App.css";
import { Route, Routes } from "react-router-dom";
import Inicio from "./components/Inicio";
import PanelCreationForm from "./admin/PanelCreationForm";
import EnterpriseWallet from "./admin/EnterpriseWallet";
import PaymentManagement from "./admin/PaymentManagement";
import HolderList from "./admin/HolderList";
import SignUp from "./components/Authentication/SignUp";
import SignIn from "./components/Authentication/SignIn";
import Oportunities from "./components/investor";
import BondDetails from "./components/investor/Details";
import Manage from "./admin/Manage";
import BuyToken from "./admin/BuyToken";
import RetailMarket from "./admin/RetailMarket";
import InvestmentWallet from "./components/investor/InvestmentWallet";
import Admin from "./admin/Admin";
import Lux from "./admin/ElectricityPrice";
import MyPanels from "./components/investor/MyPanels";
import PanelDetails from "./components/PanelDetais";
import TransactionTable from "./admin/TransactionTable";
import InvestorList from "./admin/InvestorList";
import InvestorDetails from "./admin/InvestroDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/user-access" element={<SignIn />} />
      <Route path="/user-registration" element={<SignUp />} />
      <Route path="/admin-dash" element={<Admin />} />
      <Route path="/form" element={<PanelCreationForm />} />
      <Route path="/manage-bonds" element={<Manage />} />
      <Route path="/add-to-market" element={<RetailMarket />} />
      <Route path="/investor-registration" element={<BuyToken />} />
      <Route path="/holder-list" element={<HolderList />} />
      <Route path="/management-menu" element={<EnterpriseWallet />} />
      <Route path="/payment-management" element={<PaymentManagement />} />
      <Route path="/transactions" element={<TransactionTable />} />
      <Route path="/user-list" element={<InvestorList />} />
      <Route path="/investor/:id" element={<InvestorDetails />} />
      <Route path="/investor-dash" element={<Oportunities />} />
      <Route path="/investor-wallet" element={<InvestmentWallet />} />
      <Route path="/purchase-details/:id" element={<BondDetails />} />
      <Route path="/my-panels" element={<MyPanels />} />
      <Route path="/panel-details" element={<PanelDetails />} />
      <Route path="/lux" element={<Lux />} />
    </Routes>
  );
}

export default App;
