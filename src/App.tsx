import { useState } from 'react'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import './App.css'

import store from '@/store';
import { ThemeProvider } from 'styled-components';
import { observer } from 'mobx-react-lite';
import {
  DEFAULT_TITLEBAR_HEIGHT,
  COMPACT_TITLEBAR_HEIGHT,
  DEFAULT_TAB_MARGIN_TOP,
  COMPACT_TAB_MARGIN_TOP,
  COMPACT_TAB_HEIGHT,
  DEFAULT_TAB_HEIGHT,
} from '@/constants/design';
import { Titlebar } from '@/views/app/components/titlebar';

// function App() {
//   const [count, setCount] = useState(0)
//   return (
//     <div className='App'>
//       <div className='logo-box'>
//         <a href='https://github.com/electron-vite/electron-vite-react' target='_blank'>
//           <img src={logoVite} className='logo vite' alt='Electron + Vite logo' />
//           <img src={logoElectron} className='logo electron' alt='Electron + Vite logo' />
//         </a>
//       </div>
//       <h1>Electron + Vite + React</h1>
//       <div className='card'>
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className='read-the-docs'>
//         Click on the Electron + Vite logo to learn more
//       </p>
//       <div className='flex-center'>
//         Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
//       </div>

//     </div>
//   )
// }


const App = observer(() => {
  return (
    <ThemeProvider
      theme={{
        ...store.theme,
        animations: true,
        isCompact: false,
        titlebarHeight: DEFAULT_TITLEBAR_HEIGHT,
        tabMarginTop: DEFAULT_TAB_MARGIN_TOP,
        tabHeight: DEFAULT_TAB_HEIGHT,
      }}
    >
      <Titlebar />
      <div className='App'>
        <h1>Electron + Vite + React , Electron + Vite + React</h1>
        <div className='card'>
          <button>
            count is
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className='read-the-docs'>
          Click on the Electron + Vite logo to learn more
        </p>
        <div className='flex-center'>
          Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
        </div>
      </div>
    </ThemeProvider>
  );
});


export default App