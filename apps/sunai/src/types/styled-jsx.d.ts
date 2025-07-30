import 'react'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            style: React.DetailedHTMLProps<
                React.StyleHTMLAttributes<HTMLStyleElement> & {
                    jsx?: boolean
                    global?: boolean
                },
                HTMLStyleElement
            >
        }
    }
}
