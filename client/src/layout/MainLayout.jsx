import { AppContextProvider } from '@/context/appContext';

import { Layout } from 'antd';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  return (
    <AppContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin: '30px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
        }}
      >
        {children}
      </Content>
    </AppContextProvider>
  );
}