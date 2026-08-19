import { useCountry } from "@/context/CountryContext"

export function MapMock() {
    const { currency, exchangeRates } = useCountry()

    const convert = (amount) => {
        const rate = exchangeRates[currency] || 1
        return Math.round(amount * rate)
    }

    const getSymbol = () => {
        switch (currency) {
            case "USD": return "$"
            case "EUR": return "€"
            case "GBP": return "£"
            case "CAD": return "C$"
            case "AUD": return "A$"
            case "AED": return "AED"
            case "INR": return "₹"
            case "JPY": return "¥"
            default: return currency + " "
        }
    }

    const symbol = getSymbol()

    return (
        <div className="w-full h-full min-h-[600px] bg-gray-200 rounded-xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-50"
                style={{
                    backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            />
            <div className="z-10 bg-white p-4 rounded-lg shadow-lg text-center">
                <p className="font-bold text-gray-500">Interactive Map View</p>
                <p className="text-xs text-gray-400">(Map integration placeholder)</p>
            </div>

            {/* Mock Pins */}
            <div className="absolute top-1/4 left-1/4 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                {symbol}{convert(150)}
            </div>
            <div className="absolute top-1/2 left-1/2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                {symbol}{convert(250)}
            </div>
            <div className="absolute bottom-1/3 right-1/3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                {symbol}{convert(180)}
            </div>
        </div>
    )
}
