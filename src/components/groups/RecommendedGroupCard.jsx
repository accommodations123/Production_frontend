import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export function RecommendedGroupCard({ title, groupName, members, image }) {
    return (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
                {/* Image/Icon */}
                <div className="h-12 w-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {image ? (
                        <img src={image} alt={groupName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
                    <h4 className="font-bold text-gray-900 text-sm truncate mb-1">{groupName}</h4>
                    <span className="text-accent text-xs font-bold">{members} members</span>
                </div>

                {/* Join Button */}
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold h-8 px-4 rounded-lg shrink-0">
                    Join
                </Button>
            </CardContent>
        </Card>
    )
}
