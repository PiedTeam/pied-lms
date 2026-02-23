'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function MentorTimetablesPage() {
	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Timetables</h1>
				<p className="text-sm text-muted-foreground">
					Based on API: <code className="font-mono">/timetables/me</code>,{' '}
					<code className="font-mono">/timetables/search</code>,{' '}
					<code className="font-mono">/timetables/diff</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Search by time</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<div className="space-y-2">
							<p className="text-sm font-medium">Day of week</p>
							<Input placeholder="e.g. Monday (or 1..7)" />
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">Start time</p>
							<Input placeholder="HH:mm" />
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">End time</p>
							<Input placeholder="HH:mm" />
						</div>
					</div>
					<div className="flex gap-2">
						<Button>Search</Button>
						<Button variant="outline">Reset</Button>
					</div>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Compare (diff)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<p className="text-sm font-medium">User/Timetable A</p>
							<Input placeholder="userId or timetableId" />
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">User/Timetable B</p>
							<Input placeholder="userId or timetableId" />
						</div>
					</div>
					<Button variant="secondary">Compare</Button>
					<p className="text-xs text-muted-foreground">
						UI skeleton only — wiring API later.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}

