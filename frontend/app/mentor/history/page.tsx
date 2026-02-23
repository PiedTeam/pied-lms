'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function MentorHistoryPage() {
	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">History</h1>
				<p className="text-sm text-muted-foreground">
					Public swap history board: <code className="font-mono">/history/swaps/public</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Public board</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						UI skeleton: render a timeline/table of swap events here.
					</p>
					<div className="flex gap-2">
						<Button>Load</Button>
						<Button variant="outline">Export (later)</Button>
					</div>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Notes</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Mentor có quyền xem bảng history công khai; phần lọc/pagination sẽ làm khi nối API.
				</CardContent>
			</Card>
		</div>
	)
}

