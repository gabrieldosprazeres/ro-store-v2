interface CompatibilityTableProps {
  emulators: string[]
  installType: string
  clientRequirements: string | null
}

export function CompatibilityTable({
  emulators,
  installType,
  clientRequirements,
}: CompatibilityTableProps) {
  const rows = [
    { label: 'Emulador', value: emulators.join(', ') },
    { label: 'Instalação', value: installType },
    ...(clientRequirements
      ? [{ label: 'Requisitos', value: clientRequirements }]
      : []),
  ]

  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-border last:border-b-0">
            <td className="py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">
              {row.label}
            </td>
            <td className="py-2 font-mono text-foreground">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
