import { Search } from "lucide-react";

function SearchComponent()
{
    return(
        <>
        <div className="relative w-64">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400"/>
    </div>
    <input 
        type="text" 
        placeholder="Pesquisar ficheiros..."
        className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-md leading-5   placeholder-gray-400 focus:outline-none bg-white text-gray-900 sm:text-sm transition duration-150 ease-in-out"
    />
</div>
        </>
    );
}
export default SearchComponent