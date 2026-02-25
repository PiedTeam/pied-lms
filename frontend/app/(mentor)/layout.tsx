'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MentorSidebar } from '@/components/mentor/MentorSidebar'

export default function MentorLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<ProtectedRoute requiredRole="MENTOR">
			<div className="flex min-h-screen">
				<MentorSidebar />
				<main className="flex-1 ml-64">{children}</main>
			</div>
		</ProtectedRoute>
	)
}

