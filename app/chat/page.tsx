import { Laptop, Skull } from "lucide-react";
import SearchComponent from "./_components/search";

export default function ChatHomeScreen() {

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#222E35] text-center">
        <div className="max-w-md space-y-2">
          <Skull className="w-72 h-72 mx-auto text-[#364147]" />
          <h2 className="text-[#E9EDEF] text-3xl font-light">Spiral Chat</h2>
          <p className="text-[#8696A0]">Search for "SpiralshopAdmin" or "Admin" to speak with an agent. </p>
          <SearchComponent onSidebar={false} />
        </div>
      </div>
    </>
  )
}