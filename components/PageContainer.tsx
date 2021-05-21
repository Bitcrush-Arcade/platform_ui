// React
import { useState } from 'react'
// Components
import Menu from 'components/Menu'

const PageContainer = () => {
  const [menuToggle, setMenuToggle] = useState<boolean>(false)

  const toggleMenu = () => setMenuToggle( p => !p )
  return<>
    <Menu open={menuToggle} toggleOpen={toggleMenu}/>
  </>
}

export default PageContainer