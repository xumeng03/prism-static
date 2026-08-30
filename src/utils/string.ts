export function getInitials(name: string) {
    return name?.[0]?.toUpperCase() ?? '?'
}