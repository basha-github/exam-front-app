import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'
import ExcelUpload from './components/ExcelUpload'
import QuestionsTable from './components/QuestionsTable'

export default function App() {
  return (
    <div>

<BrowserRouter>
<Routes>

<Route path="/" element={<LoginPage />} />
<Route path="/home" element={<HomePage />} />
<Route path="/upload" element={<ExcelUpload />} />
<Route path="/questions" element={<QuestionsTable />} />


</Routes>
</BrowserRouter>


    </div>
  )
}
