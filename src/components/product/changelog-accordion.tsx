'use client'

import { formatDate } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Version {
  id: string
  version_number: string
  changelog: string
  created_at: string
}

interface ChangelogAccordionProps {
  versions: Version[]
}

export function ChangelogAccordion({ versions }: ChangelogAccordionProps) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma versão registrada ainda.</p>
    )
  }

  return (
    <Accordion type="single" collapsible defaultValue={versions[0]?.id}>
      {versions.map((version) => (
        <AccordionItem key={version.id} value={version.id}>
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-3">
              <span className="font-mono font-medium text-accent">
                v{version.version_number}
              </span>
              <span className="text-muted-foreground font-normal">
                {formatDate(version.created_at)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
              {version.changelog}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
