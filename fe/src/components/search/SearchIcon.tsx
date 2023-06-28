import { useState } from 'react'
import { useNavigate } from 'react-router'

export const SearchIcon = () => {
  const [inputData, setInputData] = useState<string>('')
  const navigate = useNavigate()

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && inputData !== '') {
      setInputData('');
      navigate(`/search/${inputData}`)
    }
  };

  return (
    <div className="flex items-center w-full flex-wrap">
      <input
        onChange={(event) => setInputData(event.target.value)}
        type="search"
        className="h-[40px] w-[200px] relative m-0 block  min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-700 outline-none transition duration-300 ease-in-out focus:border-primary-600 focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200"
        placeholder="Find something..."
        onKeyDown={handleKeyDown}
        value={inputData}
      />
    </div>
  )
}
