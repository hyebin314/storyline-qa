import { useState } from 'react'
import TabBar from './components/TabBar'
import FAB from './components/FAB'
import WriteDrawer from './components/WriteDrawer'
import HomePage from './pages/HomePage'
import DailyReportPage from './pages/DailyReportPage'
import NoticePage from './pages/NoticePage'
import AlbumPage from './pages/AlbumPage'
import MyPage from './pages/MyPage'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [writeDrawer, setWriteDrawer] = useState({ open: false, type: null })

  const openWrite = (type = null) => setWriteDrawer({ open: true, type })
  const closeWrite = () => setWriteDrawer({ open: false, type: null })

  const renderPage = () => {
    switch (activeTab) {
      case 'home':   return <HomePage onOpenWrite={openWrite} />
      case 'report': return <DailyReportPage />
      case 'notice': return <NoticePage />
      case 'album':  return <AlbumPage />
      case 'my':     return <MyPage />
      default:       return <HomePage onOpenWrite={openWrite} />
    }
  }

  return (
    <div className="app">
      <div className="page-wrapper">
        {renderPage()}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <FAB onOpen={openWrite} />
      {writeDrawer.open && (
        <WriteDrawer initialType={writeDrawer.type} onClose={closeWrite} />
      )}
    </div>
  )
}
