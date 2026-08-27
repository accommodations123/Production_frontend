import { useMemo, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useGetMeQuery, useLogoutMutation, authApi } from "@/store/api/authApi"
import { useGetHostProfileQuery, hostApi } from "@/store/api/hostApi"
import { clearAuthCookie } from "@/shared/utils/cookieUtils"
import { getSocket, disconnectSocket } from "@/shared/utils/socket"
import { resolveImageUrl } from "@/shared/utils/imageUtils"

/**
 * Single source of truth for current user state, profile image resolution,
 * display name, logout, socket lifecycle, and country code helpers.
 */
export function useCurrentUser() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const socketRef = useRef(null)

    // getMe triggers the authSlice matchFulfilled/matchRejected matchers
    // which auto-sync state.user — no manual dispatch needed
    const { data: userData, error: isAuthError } = useGetMeQuery()
    const isAuthenticated = !!userData && !isAuthError

    const [logoutMutation] = useLogoutMutation()

    const { data: hostProfile } = useGetHostProfileQuery(undefined, {
        skip: !isAuthenticated,
    })

    const resolvedUser = useMemo(() => {
        const details = userData?.user || userData || {}
        const candidates = [hostProfile?.profile_image, details?.profile_image]
        const fullUrl = candidates.find((img) => img?.startsWith("http"))
        const profile_image = fullUrl || resolveImageUrl(candidates.find((img) => img))

        return { ...(hostProfile || {}), ...details, profile_image }
    }, [userData, hostProfile])

    const displayName = useMemo(() => {
        const name = resolvedUser?.name
        const fullName = resolvedUser?.full_name
        const emailName = resolvedUser?.email?.split("@")[0]
        return (name?.trim()) || (fullName?.trim()) || emailName || "User"
    }, [resolvedUser])

    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap()
        } catch (e) {
            console.warn("Backend logout failed, proceeding with local cleanup", e)
        }
        disconnectSocket()
        clearAuthCookie()
        dispatch(authApi.util.resetApiState())
        dispatch(hostApi.util.resetApiState())
        navigate("/signin")
    }

    // WebSocket lifecycle — only while authenticated
    useEffect(() => {
        if (!isAuthenticated) return
        const socket = getSocket()
        socketRef.current = socket

        const onError = (err) => console.error("Socket error:", err.message)
        socket.on("connect_error", onError)

        return () => {
            socket.off("connect_error", onError)
            socketRef.current = null
        }
    }, [isAuthenticated])

    const getCountryCode = (activeCountry) => {
        if (!activeCountry) return ""
        return activeCountry.code || activeCountry.country || ""
    }

    return {
        isAuthenticated,
        resolvedUser,
        displayName,
        handleLogout,
        getCountryCode,
    }
}
