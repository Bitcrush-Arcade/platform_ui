// React
import { useState } from 'react'
// Components
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'

const PageContainer = () => {
  const [menuToggle, setMenuToggle] = useState<boolean>(false)

  const toggleMenu = () => setMenuToggle( p => !p )
  return<>
    <Header open={menuToggle} toggleOpen={toggleMenu}/>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
  </>
}

export default PageContainer