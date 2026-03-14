'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function MentorDashboardPage() {
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Mentor Dashboard
					</h1>
					<p className="text-sm text-muted-foreground">
						Quick access to timetable analysis, students, slot advice, and history.
					</p>
				</div>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href="/mentor/timetables">Open Timetables</Link>
					</Button>
					<Button asChild>
						<Link href="/mentor/students">Find Student</Link>
					</Button>
				</div>
			</div>

			<Separator />

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Timetable</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						View your timetable, search by time, and compare diffs.
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Students</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Search students and (later) move students manually.
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Slot Advice</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Create/update advice for a slot (mentor/admin only).
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">History</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						View public swap history board.
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

