'use client'

import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function MentorProfilePage() {
	const user = useAuthStore(state => state.user)

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
				<p className="text-sm text-muted-foreground">
					Thông tin cơ bản của mentor.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Account</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Full name</span>
						<span className="font-medium">{user?.fullName || '—'}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Email</span>
						<span className="font-medium">{user?.email || '—'}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Role</span>
						<span className="font-medium">{user?.role || '—'}</span>
					</div>
					<Separator className="my-2" />
					<p className="text-muted-foreground">
						Nếu cần “edit profile”, mình sẽ thêm form + API sau.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}

