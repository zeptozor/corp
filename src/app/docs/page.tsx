'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '@/components/ui/header'

const markdownStyles = {
  h1: 'text-4xl font-bold mb-6 mt-8',
  h2: 'text-3xl font-bold mb-5 mt-7',
  h3: 'text-2xl font-bold mb-4 mt-6',
  h4: 'text-xl font-bold mb-3 mt-5',
  p: 'mb-4 text-gray-700 leading-relaxed',
  ul: 'list-disc pl-6 mb-4',
  ol: 'list-decimal pl-6 mb-4',
  li: 'mb-2',
  blockquote: 'border-l-4 border-gray-300 pl-4 italic my-4',
  a: 'text-blue-600 hover:text-blue-800 underline',
  table: 'min-w-full border-collapse mb-4',
  th: 'border border-gray-300 px-4 py-2 bg-gray-100',
  td: 'border border-gray-300 px-4 py-2',
  pre: 'bg-gray-100 rounded-lg p-4 mb-4 overflow-x-auto',
  code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm',
  img: 'max-w-full h-auto rounded-lg shadow-md my-6',
}

export default function DocsPage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/docs')
        if (!response.ok) throw new Error('Failed to fetch docs')
        const data = await response.json()
        setContent(data.content)
      } catch (error) {
        console.error('Error fetching docs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <article className='prose prose-lg max-w-none'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className={markdownStyles.h1}>{children}</h1>,
              h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
              h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
              h4: ({ children }) => <h4 className={markdownStyles.h4}>{children}</h4>,
              p: ({ children }) => <p className={markdownStyles.p}>{children}</p>,
              ul: ({ children }) => <ul className={markdownStyles.ul}>{children}</ul>,
              ol: ({ children }) => <ol className={markdownStyles.ol}>{children}</ol>,
              li: ({ children }) => <li className={markdownStyles.li}>{children}</li>,
              blockquote: ({ children }) => <blockquote className={markdownStyles.blockquote}>{children}</blockquote>,
              a: ({ href, children }) => (
                <a href={href} className={markdownStyles.a} target='_blank' rel='noopener noreferrer'>
                  {children}
                </a>
              ),
              table: ({ children }) => <table className={markdownStyles.table}>{children}</table>,
              th: ({ children }) => <th className={markdownStyles.th}>{children}</th>,
              td: ({ children }) => <td className={markdownStyles.td}>{children}</td>,
              pre: ({ children }) => <pre className={markdownStyles.pre}>{children}</pre>,
              code: ({ children }) => <code className={markdownStyles.code}>{children}</code>,
              img: ({ src, alt }) => (
                <div className='flex justify-center'>
                  <img
                    src={src}
                    alt={alt || ''}
                    className={markdownStyles.img}
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                    loading='lazy'
                  />
                </div>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </>
  )
}
