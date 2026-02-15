'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export default function MentorSlotAdvicePage() {
	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Slot Advice</h1>
				<p className="text-sm text-muted-foreground">
					Create/update slot advice via{' '}
					<code className="font-mono">POST /slots/&lbrace;id&rbrace;/advice</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Edit advice</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						<div className="space-y-2 md:col-span-1">
							<p className="text-sm font-medium">Slot ID</p>
							<Input placeholder="slotId" />
						</div>
						<div className="space-y-2 md:col-span-2">
							<p className="text-sm font-medium">Title</p>
							<Input placeholder="Short title..." />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium">Advice content</p>
						<Textarea placeholder="Write guidance for this slot..." rows={8} />
					</div>
					<div className="flex gap-2">
						<Button>Save</Button>
						<Button variant="outline">Preview</Button>
					</div>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">View advice</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<p className="text-sm text-muted-foreground">
						Fetch from <code className="font-mono">GET /slots/&lbrace;id&rbrace;/advice</code>.
					</p>
					<Input placeholder="slotId to view..." />
					<Button variant="secondary">Load</Button>
				</CardContent>
			</Card>
		</div>
	)
}

