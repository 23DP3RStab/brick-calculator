import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CaseList from './components/CaseList';
import BuildingCaseForm from './components/BuildingCaseForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {}
          <Route path="/" element={<CaseList />} />
          
          {}
          <Route path="/new" element={<BuildingCaseForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;