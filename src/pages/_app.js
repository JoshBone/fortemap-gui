import {ConfigProvider} from "antd";
import theme from "@/theme/themeConfig";
import AppLayout from "@/components/Layout/AppLayout";
import '@/style/global.scss'
import {EditingStatusProvider, SelectedLocationProvider} from "@/utils/sharedStateProviders";

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider theme={theme}>
        <AppLayout>
            <EditingStatusProvider>
                <SelectedLocationProvider>
                    <Component {...pageProps} />
                </SelectedLocationProvider>
            </EditingStatusProvider>
        </AppLayout>
    </ConfigProvider>
  )
}
