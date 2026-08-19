import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export function GroupTopicCard({ title, description, icon: Icon, members }) {
    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer rounded-xl h-full flex flex-col">
            <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                {/* <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    {Icon ? <Icon className="h-7 w-7 text-primary" /> : <Users className="h-7 w-7 text-primary" />}
                </div> */}

                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                    {description}
                </p>

                <div className="text-accent font-bold text-sm bg-accent/5 px-3 py-1 rounded-full">
                    {members} members
                </div>
            </CardContent>
        </Card>
    )
}
