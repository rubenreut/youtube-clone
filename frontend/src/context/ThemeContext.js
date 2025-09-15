import{ createContext, useState, useContext, useEffect} from 'react';

const ThemeContext = createContext();

export function ThemeProvider({children}) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    //Load theme from localStorage 
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDarkMode(savedTheme === 'dark');
        if(savedTheme === 'dark'){
            document.body.classList.add('dark-mode');
        }
    }, []);

    const toggleDarkMode = () =>{
        setIsDarkMode(!isDarkMode);
        if(!isDarkMode){
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        else{
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode}}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext)