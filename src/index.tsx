import { render } from 'react-dom';
import { ThemeProvider } from '@wedevs/plugin-ui';
import EmployeeManagerApp from './components/EmployeeManagerApp';

const App = () => (
    <ThemeProvider pluginId="employee-manager">
        <EmployeeManagerApp />
    </ThemeProvider>
);

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('employee-manager-app');
    if (container) {
        render(<App />, container);
    }
});