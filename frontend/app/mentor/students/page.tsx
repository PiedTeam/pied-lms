'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function MentorStudentsPage() {
	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Students</h1>
				<p className="text-sm text-muted-foreground">
					Search students via <code className="font-mono">/students/search</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Find student</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-col gap-3 md:flex-row">
						<Input
							placeholder="Search by name, student code, or email..."
							className="md:flex-1"
						/>
						<div className="flex gap-2">
							<Button>Search</Button>
							<Button variant="outline">Clear</Button>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Kết quả hiển thị (table/list) sẽ nối API sau.
					</p>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Manual move (coming soon)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Dự kiến dùng endpoint <code className="font-mono">/admin/students/move</code>{' '}
						(roles: Admin, Mentor).
					</p>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<Input placeholder="studentId" />
						<Input placeholder="fromClass/slot" />
						<Input placeholder="toClass/slot" />
					</div>
					<Button variant="secondary" disabled>
						Move student
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

